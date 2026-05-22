import os
import hashlib

paths = [
    r"C:\COO\開発部門\LinguoSync\suite-gatekeeper.js",
    r"C:\COO\開発部門\NovaCapital\suite-gatekeeper.js",
    r"C:\COO\開発部門\SocialIntent\suite-gatekeeper.js",
    r"C:\COO\開発部門\StudyFlow\suite-gatekeeper.js"
]

hashes = {}
for p in paths:
    with open(p, 'rb') as f:
        h = hashlib.sha256(f.read()).hexdigest()
        hashes[os.path.basename(os.path.dirname(p))] = h

print("Hashes:")
for k, v in hashes.items():
    print(f"{k}: {v}")
