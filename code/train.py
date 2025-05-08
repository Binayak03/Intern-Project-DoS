# Training data
import numpy as np
import pandas as pd
import sys
import pickle
import os
from sklearn.neighbors import KNeighborsClassifier
import time
from sklearn.preprocessing import StandardScaler

# Get the directory containing the script
script_dir = os.path.dirname(os.path.abspath(__file__))
# Construct path to the dataset
dataset_path = os.path.join(script_dir, "revised_dataset.csv")

try:
    df = pd.read_csv(dataset_path, index_col=0)
except FileNotFoundError:
    print(f"Error: Could not find the dataset file at {dataset_path}")
    print("Please ensure the revised_dataset.csv file is in the same directory as this script")
    sys.exit(1)
except Exception as e:
    print(f"Error reading the dataset: {str(e)}")
    sys.exit(1)

def update_progress(progress_file, stage, percentage, message):
    """Update the progress file with current training status"""
    try:
        with open(progress_file, 'w') as f:
            f.write(f"{stage}|{percentage}|{message}")
    except Exception as e:
        print(f"Error updating progress file: {str(e)}")

def train_icmp(df, classifier=0, progress_file=None):
    """
    Only two best classifiers have been employed on these datasets
    """
    try:
        if progress_file:
            update_progress(progress_file, "preprocessing", 10, "Starting ICMP data preprocessing...")
        
        if df is None:
            raise ValueError("DataFrame is required for training")
            
        icmp_df = df[df.loc[:,"protocol_type"] == "icmp"].copy()
        if len(icmp_df) == 0:
            raise ValueError("No ICMP data found in the dataset")
            
        icmp_features = ["duration","src_bytes","wrong_fragment","count","urgent","num_compromised","srv_count"]
        icmp_target = "result"
        
        # Handle missing values
        icmp_df[icmp_features] = icmp_df[icmp_features].fillna(0)
        
        X = icmp_df.loc[:,icmp_features]
        y = icmp_df.loc[:,icmp_target]
        
        if progress_file:
            update_progress(progress_file, "preprocessing", 30, "Processing class labels...")
        
        # Convert labels: 'normal.' -> 0, all others -> 1
        y = y.apply(lambda x: 0 if x == 'normal.' else 1)
        
        if progress_file:
            update_progress(progress_file, "preprocessing", 50, "Data preprocessing completed")
        
        # Scale features
        scaler = StandardScaler()
        X = pd.DataFrame(scaler.fit_transform(X), columns=icmp_features)
        
        # Ensure all values are numeric
        X = X.astype(float)
        
        #choose KNN if classifier == 0 else choose Decision Tree
        if str(classifier) == "0":
            k = 3  # Reduced k for more sensitive detection
            model = KNeighborsClassifier(n_neighbors=k, weights='distance', metric='manhattan')
        elif str(classifier) == "1":
            from sklearn.tree import DecisionTreeClassifier
            model = DecisionTreeClassifier(max_depth=5, min_samples_split=2)
        else:
            print("Wrong model chosen! Placing default model 0 to model training!")
            k = 3
            model = KNeighborsClassifier(n_neighbors=k, weights='distance', metric='manhattan')
        
        if progress_file:
            update_progress(progress_file, "training", 70, "Training model...")
        
        #fitting our model
        model.fit(X,y)
        
        if progress_file:
            update_progress(progress_file, "training", 90, "Model training completed")
        
        # Save the model and scaler
        model_path = os.path.join(script_dir, "saved_model", "icmp_data.sav")
        scaler_path = os.path.join(script_dir, "saved_model", "icmp_scaler.sav")
        
        # Ensure the saved_model directory exists
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        
        pickle.dump(model, open(model_path, 'wb'))
        pickle.dump(scaler, open(scaler_path, 'wb'))
        
        if progress_file:
            update_progress(progress_file, "complete", 100, "ICMP model saved successfully")
        
        return True
    except Exception as e:
        if progress_file:
            update_progress(progress_file, "error", 0, f"Error in ICMP training: {str(e)}")
        raise

def train_tcp_syn(df, classifier=0, progress_file=None):
    """
    Only two best classifiers have been employed on these datasets
    """
    try:
        if progress_file:
            update_progress(progress_file, "preprocessing", 10, "Starting TCP SYN data preprocessing...")
        
        if df is None:
            raise ValueError("DataFrame is required for training")
            
        tcp_syn_df = df[df.loc[:,"protocol_type"] == "tcp"]
        tcp_syn_df = tcp_syn_df[tcp_syn_df.loc[:,"srv_serror_rate"] > 0.7]
        
        if len(tcp_syn_df) == 0:
            raise ValueError("No TCP SYN data found in the dataset")
        
        if progress_file:
            update_progress(progress_file, "preprocessing", 30, "Processing service values...")
        
        service_values = np.unique(tcp_syn_df.loc[:,"service"])
        mid = (len(service_values)+1)/2
        for i in range(len(service_values)):
            tcp_syn_df = tcp_syn_df.replace(service_values[i], (i-mid)/10)
        
        features = ["service","count","srv_count","src_bytes","serror_rate"]
        target = "result"
        
        X = tcp_syn_df.loc[:,features]
        y = tcp_syn_df.loc[:,target]
        
        if progress_file:
            update_progress(progress_file, "preprocessing", 50, "Processing class labels...")
        
        # Convert labels: 'normal.' -> 0, all others -> 1
        y = y.apply(lambda x: 0 if x == 'normal.' else 1)
        
        if progress_file:
            update_progress(progress_file, "preprocessing", 70, "Data preprocessing completed")
        
        # Scale features
        scaler = StandardScaler()
        X = pd.DataFrame(scaler.fit_transform(X), columns=features)
        
        #choose KNN if classifier == 0 else choose Decision Tree
        if str(classifier) == "0":
            k = 3  # Reduced k for more sensitive detection
            model = KNeighborsClassifier(n_neighbors=k, weights='distance', metric='manhattan')
        elif str(classifier) == "1":
            from sklearn.tree import DecisionTreeClassifier
            model = DecisionTreeClassifier(max_depth=5, min_samples_split=2)
        else:
            print("Wrong model chosen! Placing default model 0 to model training!")
            k = 3
            model = KNeighborsClassifier(n_neighbors=k, weights='distance', metric='manhattan')
        
        if progress_file:
            update_progress(progress_file, "training", 80, "Training model...")
        
        #fitting our model
        model.fit(X,y)
        
        if progress_file:
            update_progress(progress_file, "training", 90, "Model training completed")
        
        # Save the model and scaler
        model_path = os.path.join(script_dir, "saved_model", "tcp_syn_data.sav")
        scaler_path = os.path.join(script_dir, "saved_model", "tcp_syn_scaler.sav")
        
        # Ensure the saved_model directory exists
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        
        pickle.dump(model, open(model_path, 'wb'))
        pickle.dump(scaler, open(scaler_path, 'wb'))
        
        if progress_file:
            update_progress(progress_file, "complete", 100, "TCP SYN model saved successfully")
        
        return True
    except Exception as e:
        if progress_file:
            update_progress(progress_file, "error", 0, f"Error in TCP SYN training: {str(e)}")
        raise

def train_udp(df, classifier=0, progress_file=None):
    """
    Only two best classifiers have been employed on these datasets
    """
    try:
        if progress_file:
            update_progress(progress_file, "preprocessing", 10, "Starting UDP data preprocessing...")
        
        if df is None:
            raise ValueError("DataFrame is required for training")
            
        udp_df = df[df.loc[:,"protocol_type"] == "udp"]
        
        if len(udp_df) == 0:
            raise ValueError("No UDP data found in the dataset")
        
        if progress_file:
            update_progress(progress_file, "preprocessing", 30, "Processing service values...")
        
        service_values = np.unique(udp_df.loc[:,"service"])
        mid = (len(service_values)+1)/2
        for i in range(len(service_values)):
            udp_df = udp_df.replace(service_values[i], (i-mid)/10)
        
        udp_features = ["dst_bytes","service","src_bytes","dst_host_srv_count","count"]
        udp_target = "result"
        
        X = udp_df.loc[:,udp_features]
        y = udp_df.loc[:,udp_target]
        
        if progress_file:
            update_progress(progress_file, "preprocessing", 50, "Processing class labels...")
        
        # Convert labels: 'normal.' -> 0, all others -> 1
        y = y.apply(lambda x: 0 if x == 'normal.' else 1)
        
        if progress_file:
            update_progress(progress_file, "preprocessing", 70, "Data preprocessing completed")
        
        # Scale features
        scaler = StandardScaler()
        X = pd.DataFrame(scaler.fit_transform(X), columns=udp_features)
        
        #choose KNN if classifier == 0 else choose Decision Tree
        if str(classifier) == "0":
            k = 3  # Reduced k for more sensitive detection
            model = KNeighborsClassifier(n_neighbors=k, weights='distance', metric='manhattan')
        elif str(classifier) == "1":
            from sklearn.tree import DecisionTreeClassifier
            model = DecisionTreeClassifier(max_depth=5, min_samples_split=2)
        else:
            print("Wrong model chosen! Placing default model 0 to model training!")
            k = 3
            model = KNeighborsClassifier(n_neighbors=k, weights='distance', metric='manhattan')
        
        if progress_file:
            update_progress(progress_file, "training", 80, "Training model...")
        
        #fitting our model
        model.fit(X,y)
        
        if progress_file:
            update_progress(progress_file, "training", 90, "Model training completed")
        
        # Save the model and scaler
        model_path = os.path.join(script_dir, "saved_model", "udp_data.sav")
        scaler_path = os.path.join(script_dir, "saved_model", "udp_scaler.sav")
        
        # Ensure the saved_model directory exists
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        
        pickle.dump(model, open(model_path, 'wb'))
        pickle.dump(scaler, open(scaler_path, 'wb'))
        
        if progress_file:
            update_progress(progress_file, "complete", 100, "UDP model saved successfully")
        
        return True
    except Exception as e:
        if progress_file:
            update_progress(progress_file, "error", 0, f"Error in UDP training: {str(e)}")
        raise

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Error: Missing required arguments")
        print("\nUsage:")
        print("python train.py <protocol> <classifier>")
        print("\nwhere:")
        print("  <protocol>   : Protocol type (icmp, tcp_syn, or udp)")
        print("  <classifier> : Classifier type (0 for KNN, 1 for Decision Tree)")
        print("\nExample:")
        print("  python train.py icmp 0")
        sys.exit(1)
    
    if len(sys.argv) < 3:
        print("Error: Missing classifier argument")
        print("Using default classifier (0 - KNN)")
        classifier = "0"
    else:
        classifier = sys.argv[2]
    
    protocol = str(sys.argv[1]).lower()
    if protocol == "icmp":
        train_icmp(df, classifier)
    elif protocol == "tcp_syn":
        train_tcp_syn(df, classifier)
    elif protocol == "udp":
        train_udp(df, classifier)
    else:
        print("Error: Invalid protocol type")
        print("Protocol must be one of: icmp, tcp_syn, udp")
        sys.exit(1)
        
