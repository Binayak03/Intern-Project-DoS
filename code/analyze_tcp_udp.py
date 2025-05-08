import pandas as pd
import numpy as np
import os

# Get the directory containing the script
script_dir = os.path.dirname(os.path.abspath(__file__))
# Construct path to the dataset
dataset_path = os.path.join(script_dir, "revised_dataset.csv")

# Read the dataset
df = pd.read_csv(dataset_path, index_col=0)

# TCP SYN Analysis
print("\nTCP SYN Traffic Analysis")
print("=" * 50)

# Filter TCP traffic with high srv_serror_rate
tcp_syn_df = df[df["protocol_type"] == "tcp"]
tcp_syn_df = tcp_syn_df[tcp_syn_df["srv_serror_rate"] > 0.7]

# Features for TCP SYN
tcp_features = ["service", "count", "srv_count", "src_bytes", "serror_rate"]

print("\nNormal Traffic Statistics:")
normal_stats = tcp_syn_df[tcp_syn_df["result"] == "normal."][tcp_features].describe()
print(normal_stats)

print("\nAttack Traffic Statistics:")
attack_stats = tcp_syn_df[tcp_syn_df["result"] != "normal."][tcp_features].describe()
print(attack_stats)

print("\nSample Distribution:")
print(tcp_syn_df["result"].value_counts())

# UDP Analysis
print("\n\nUDP Traffic Analysis")
print("=" * 50)

# Filter UDP traffic
udp_df = df[df["protocol_type"] == "udp"]

# Features for UDP
udp_features = ["dst_bytes", "service", "src_bytes", "dst_host_srv_count", "count"]

print("\nNormal Traffic Statistics:")
normal_stats = udp_df[udp_df["result"] == "normal."][udp_features].describe()
print(normal_stats)

print("\nAttack Traffic Statistics:")
attack_stats = udp_df[udp_df["result"] != "normal."][udp_features].describe()
print(attack_stats)

print("\nSample Distribution:")
print(udp_df["result"].value_counts()) 