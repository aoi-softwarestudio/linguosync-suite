import os

paths = [
    r"C:\COO\開発部門\LinguoSync\suite-gatekeeper.js",
    r"C:\COO\開発部門\NovaCapital\suite-gatekeeper.js",
    r"C:\COO\開発部門\SocialIntent\suite-gatekeeper.js",
    r"C:\COO\開発部門\StudyFlow\suite-gatekeeper.js"
]

for p in paths:
    if os.path.exists(p):
        stat = os.stat(p)
        print(f"{os.path.basename(os.path.dirname(p))}: inode={stat.st_ino}, size={stat.st_size}")
    else:
        print(f"{p} does not exist")
