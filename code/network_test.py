import numpy as np
import sys
import pickle
import os
import pandas as pd

def get_model_path(protocol):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(script_dir, "saved_model", f"{protocol}_data.sav")

def get_scaler_path(protocol):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(script_dir, "saved_model", f"{protocol}_scaler.sav")

def icmp_test(attributes):
    try:
        # Ensure the model and scaler files exist
        model_path = get_model_path("icmp")
        scaler_path = get_scaler_path("icmp")
        
        if not os.path.exists(model_path) or not os.path.exists(scaler_path):
            raise Exception("Model or scaler file not found. Please train the model first.")
            
        model = pickle.load(open(model_path, 'rb'))
        scaler = pickle.load(open(scaler_path, 'rb'))
        
        # Convert and validate attributes
        try:
            numeric_attributes = [float(x) for x in attributes]
        except ValueError as e:
            raise Exception(f"Invalid attribute values: {str(e)}")
            
        # Create DataFrame with feature names
        features = ["duration","src_bytes","wrong_fragment","count","urgent","num_compromised","srv_count"]
        X = pd.DataFrame([numeric_attributes], columns=features)
        
        # Ensure all values are numeric
        X = X.astype(float)
        
        # Scale the input features
        scaled_attributes = scaler.transform(X)
        result = model.predict(scaled_attributes)
        return int(result[0])  # Convert numpy int64 to Python int
    except Exception as e:
        raise Exception(f"ICMP test failed: {str(e)}")

def udp_test(attributes):
    try:
        # Ensure the model and scaler files exist
        model_path = get_model_path("udp")
        scaler_path = get_scaler_path("udp")
        
        if not os.path.exists(model_path) or not os.path.exists(scaler_path):
            raise Exception("Model or scaler file not found. Please train the model first.")
            
        model = pickle.load(open(model_path, 'rb'))
        scaler = pickle.load(open(scaler_path, 'rb'))
        
        # Convert and validate attributes
        try:
            numeric_attributes = [float(x) for x in attributes]
        except ValueError as e:
            raise Exception(f"Invalid attribute values: {str(e)}")
            
        # Create DataFrame with feature names
        features = ["dst_bytes","service","src_bytes","dst_host_srv_count","count"]
        X = pd.DataFrame([numeric_attributes], columns=features)
        
        # Ensure all values are numeric
        X = X.astype(float)
        
        # Scale the input features
        scaled_attributes = scaler.transform(X)
        result = model.predict(scaled_attributes)
        return int(result[0])  # Convert numpy int64 to Python int
    except Exception as e:
        raise Exception(f"UDP test failed: {str(e)}")

def tcp_syn_test(attributes):
    try:
        # Ensure the model and scaler files exist
        model_path = get_model_path("tcp_syn")
        scaler_path = get_scaler_path("tcp_syn")
        
        if not os.path.exists(model_path) or not os.path.exists(scaler_path):
            raise Exception("Model or scaler file not found. Please train the model first.")
            
        model = pickle.load(open(model_path, 'rb'))
        scaler = pickle.load(open(scaler_path, 'rb'))
        
        # Convert and validate attributes
        try:
            numeric_attributes = [float(x) for x in attributes]
        except ValueError as e:
            raise Exception(f"Invalid attribute values: {str(e)}")
            
        # Create DataFrame with feature names
        features = ["service","count","srv_count","src_bytes","serror_rate"]
        X = pd.DataFrame([numeric_attributes], columns=features)
        
        # Ensure all values are numeric
        X = X.astype(float)
        
        # Scale the input features
        scaled_attributes = scaler.transform(X)
        result = model.predict(scaled_attributes)
        return int(result[0])  # Convert numpy int64 to Python int
    except Exception as e:
        raise Exception(f"TCP SYN test failed: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Error: Missing required arguments")
        print("\nUsage:")
        print("python test.py <protocol> <attribute1> <attribute2> ...")
        print("\nwhere:")
        print("  <protocol> : Protocol type (icmp, tcp_syn, or udp)")
        print("  <attributes> : Numeric values for the features")
        print("\nExample:")
        print("  python test.py tcp_syn -1.5 1.0 2.0 30.0 1.0")
        sys.exit(1)
    
    protocol = sys.argv[1].lower()
    if protocol == "icmp": 
        result = icmp_test(sys.argv[2:])
        print(f"Prediction result: {result}")
    elif protocol == "tcp_syn":
        result = tcp_syn_test(sys.argv[2:])
        print(f"Prediction result: {result}")
    elif protocol == "udp":
        result = udp_test(sys.argv[2:])
        print(f"Prediction result: {result}")
    else:
        print("Error: Invalid protocol type")
        print("Protocol must be one of: icmp, tcp_syn, udp")
        sys.exit(1)