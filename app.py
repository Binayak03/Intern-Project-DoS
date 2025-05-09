from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import threading
import time
import os
import sys
import pandas as pd
import ipaddress
import random

# Get the absolute path of the current directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CODE_DIR = os.path.join(BASE_DIR, 'code')
FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend', 'build')

# Add the code directory to the Python path
sys.path.append(CODE_DIR)
from network_test import icmp_test, tcp_syn_test, udp_test

app = Flask(__name__, static_folder=FRONTEND_DIR)

# Configure CORS to allow all origins during development
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Store training progress
training_progress = {
    'icmp': {'stage': 'waiting', 'percentage': 0, 'message': 'Waiting to start...'},
    'tcp_syn': {'stage': 'waiting', 'percentage': 0, 'message': 'Waiting to start...'},
    'udp': {'stage': 'waiting', 'percentage': 0, 'message': 'Waiting to start...'}
}

# Firewall rules configuration
firewall_rules = {
    "blocked_ips": [
        ipaddress.ip_network("169.233.0.0/16"),
        ipaddress.ip_network("10.0.0.0/8"), 
        ipaddress.ip_network("172.16.0.0/12"),  
        ipaddress.ip_network("192.168.0.0/16")
    ],
    "malicious_ips": {
        ipaddress.ip_address("45.155.205.99"),
        ipaddress.ip_address("185.220.101.1"),
        ipaddress.ip_address("103.81.214.226"),
        ipaddress.ip_address("198.96.155.3"),
    },
    "suspicious_ips": {
        ipaddress.ip_address("66.240.236.119"),
        ipaddress.ip_address("209.126.136.4"),
        ipaddress.ip_address("162.247.74.200"),
    }
}

def check_firewall_rule(ip, firewall_rules):
    try:
        ip = ipaddress.ip_address(ip)
        for network in firewall_rules["blocked_ips"]:
            if ip in network:
                return "Blocked IP"
        if ip in firewall_rules["malicious_ips"]:
            return "Malicious IP"
        if ip in firewall_rules["suspicious_ips"]:
            return "Suspicious IP"
        return "Normal IP"
    except ValueError:
        return "Invalid IP Address"

def train_model(protocol, classifier):
    """Start training in a separate thread"""
    try:
        # Import training functions here to avoid circular imports
        from train import train_icmp, train_tcp_syn, train_udp, df
        
        # Create progress file in the correct directory
        progress_file = os.path.join(BASE_DIR, f"{protocol}_progress.txt")
        
        # Initialize progress
        with open(progress_file, 'w') as f:
            f.write("starting|0|Initializing training...")
            
        # Change to code directory before training
        os.chdir(CODE_DIR)
        
        if protocol == 'icmp':
            train_icmp(df, classifier, progress_file)
        elif protocol == 'tcp_syn':
            train_tcp_syn(df, classifier, progress_file)
        elif protocol == 'udp':
            train_udp(df, classifier, progress_file)
            
    except Exception as e:
        error_msg = f"Error in training: {str(e)}"
        print(error_msg)
        try:
            with open(progress_file, 'w') as f:
                f.write(f"error|0|{error_msg}")
        except Exception as write_error:
            print(f"Error writing to progress file: {str(write_error)}")

@app.route('/')
def index():
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(FRONTEND_DIR, path)

@app.route('/api/train', methods=['POST'])
def train():
    try:
        data = request.get_json()
        protocol = data.get('protocol')
        classifier = data.get('classifier', '0')
        
        if not protocol:
            return jsonify({'status': 'error', 'error': 'Protocol is required'}), 400
            
        if protocol not in ['icmp', 'tcp_syn', 'udp']:
            return jsonify({'status': 'error', 'error': 'Invalid protocol'}), 400
            
        if classifier not in ['0', '1']:
            return jsonify({'status': 'error', 'error': 'Invalid classifier. Must be 0 (KNN) or 1 (Decision Tree)'}), 400
            
        # Initialize progress file
        progress_file = os.path.join(BASE_DIR, f"{protocol}_progress.txt")
        with open(progress_file, 'w') as f:
            f.write("waiting|0|Starting training process...")
            
        # Start training in a separate thread
        thread = threading.Thread(target=train_model, args=(protocol, classifier))
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'status': 'success',
            'message': f'Training started for {protocol}',
            'progress_file': progress_file
        })
        
    except Exception as e:
        error_msg = str(e)
        print(f"Error in /api/train endpoint: {error_msg}")
        return jsonify({
            'status': 'error',
            'error': f'Error starting training: {error_msg}'
        }), 500

@app.route('/api/progress/<protocol>')
def progress(protocol):
    try:
        if protocol not in ['icmp', 'tcp_syn', 'udp']:
            return jsonify({
                'status': 'error',
                'error': 'Invalid protocol'
            }), 400
            
        progress_file = os.path.join(BASE_DIR, f"{protocol}_progress.txt")
        if os.path.exists(progress_file):
            with open(progress_file, 'r') as f:
                content = f.read().strip()
                if content:
                    stage, percentage, message = content.split('|')
                    return jsonify({
                        'status': 'success',
                        'stage': stage,
                        'percentage': float(percentage),
                        'message': message
                    })
                    
        return jsonify({
            'status': 'success',
            'stage': 'waiting',
            'percentage': 0,
            'message': 'Waiting to start...'
        })
        
    except Exception as e:
        error_msg = str(e)
        print(f"Error in /api/progress endpoint: {error_msg}")
        return jsonify({
            'status': 'error',
            'stage': 'error',
            'percentage': 0,
            'message': f'Error checking progress: {error_msg}'
        })

@app.route('/api/test', methods=['POST'])
def test():
    try:
        data = request.get_json()
        protocol = data.get('protocol')
        attributes = data.get('attributes', [])
        
        if not protocol:
            return jsonify({'status': 'error', 'error': 'Protocol is required'}), 400
            
        if not attributes:
            return jsonify({'status': 'error', 'error': 'Attributes are required'}), 400
            
        # Validate number of attributes based on protocol
        expected_attributes = {
            'icmp': 7,  # duration, src_bytes, wrong_fragment, count, urgent, num_compromised, srv_count
            'tcp_syn': 5,  # service, count, srv_count, src_bytes, serror_rate
            'udp': 5  # dst_bytes, service, src_bytes, dst_host_srv_count, count
        }
        
        if len(attributes) != expected_attributes.get(protocol, 0):
            return jsonify({
                'status': 'error',
                'error': f'Invalid number of attributes for {protocol}. Expected {expected_attributes[protocol]}, got {len(attributes)}'
            }), 400
            
        # Change to code directory before testing
        os.chdir(CODE_DIR)
        
        # Test the model
        if protocol == 'icmp':
            result = icmp_test(attributes)
        elif protocol == 'tcp_syn':
            result = tcp_syn_test(attributes)
        elif protocol == 'udp':
            result = udp_test(attributes)
        else:
            return jsonify({'status': 'error', 'error': 'Invalid protocol'}), 400
            
        return jsonify({
            'status': 'success',
            'result': result,
            'message': 'Attack detected!' if result == 1 else 'Normal traffic'
        })
        
    except Exception as e:
        error_msg = str(e)
        print(f"Error in /api/test endpoint: {error_msg}")
        return jsonify({
            'status': 'error',
            'error': f'Error during testing: {error_msg}'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'Backend server is running'})

@app.route('/api/check-ip', methods=['POST'])
def check_ip():
    try:
        data = request.get_json()
        ip_address = data.get('ip_address')
        
        if not ip_address:
            return jsonify({'status': 'error', 'error': 'IP address is required'}), 400
            
        result = check_firewall_rule(ip_address, firewall_rules)
        
        return jsonify({
            'status': 'success',
            'ip_address': ip_address,
            'result': result
        })
        
    except Exception as e:
        error_msg = str(e)
        print(f"Error in /api/check-ip endpoint: {error_msg}")
        return jsonify({
            'status': 'error',
            'error': f'Error checking IP: {error_msg}'
        }), 500

if __name__ == '__main__':
    # Ensure we start in the correct directory
    os.chdir(BASE_DIR)
    try:
        app.run(debug=True, port=5000, host='0.0.0.0')
    except Exception as e:
        print(f"Error starting server: {str(e)}")
        sys.exit(1) 