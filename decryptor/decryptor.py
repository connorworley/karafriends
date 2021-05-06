import sys

from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend


def decrypt(data):
    backend = default_backend()
    cipher = Cipher(
        algorithms.AES(b"\xF6\x86\xD8\xC6\x09\xA3\x06\xCF\xD2\x2F\x1B\x75\x01\xDD\x48\x7E"),
        modes.CBC(b"\xBA\x66\x40\x1E\xBB\x6B\xBA\xB7\x63\x34\x03\x1A\x9E\x9D\x73\xDA"),
        backend=backend,
    )
    decryptor = cipher.decryptor()
    return decryptor.update(data)


if __name__ == "__main__":
    for path in sys.argv:
        with open(path, "rb") as f_in, open(f"{path}.decrypted", "wb") as f_out:
            f_out.write(decrypt(f_in.read()))
