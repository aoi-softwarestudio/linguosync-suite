import os

root_dir = r"C:\COO\開発部門"
for root, dirs, files in os.walk(root_dir):
    for f in files:
        if f.endswith(('.html', '.js')):
            path = os.path.join(root, f)
            try:
                with open(path, 'r', encoding='utf-8') as file:
                    content = file.read()
                    if 'suite-gatekeeper' in content or 'pricing' in content or 'upgrade' in content:
                        print(f"Match found in: {os.path.relpath(path, root_dir)}")
            except Exception as e:
                pass
