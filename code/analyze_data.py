import pandas as pd
import numpy as np
import os

# Get the directory containing the script
script_dir = os.path.dirname(os.path.abspath(__file__))
# Construct path to the dataset
dataset_path = os.path.join(script_dir, "revised_dataset.csv")

# Read the dataset
df = pd.read_csv(dataset_path, index_col=0)

# Filter ICMP traffic
icmp_df = df[df["protocol_type"] == "icmp"]

# Features we're interested in
features = ["duration", "src_bytes", "wrong_fragment", "count", "urgent", "num_compromised", "srv_count"]

# Print summary statistics for normal vs attack traffic
print("\nICMP Traffic Analysis")
print("=" * 50)
print("\nNormal Traffic Statistics:")
normal_stats = icmp_df[icmp_df["result"] == "normal."][features].describe()
print(normal_stats)

print("\nAttack Traffic Statistics:")
attack_stats = icmp_df[icmp_df["result"] != "normal."][features].describe()
print(attack_stats)

# Print the number of samples in each category
print("\nSample Distribution:")
print(icmp_df["result"].value_counts()) 