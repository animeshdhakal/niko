import forge from "node-forge";

/**
 * Generates an RSA key pair (2048-bit).
 */
export async function generateKeyPair(): Promise<{
  publicKey: string;
  privateKey: string;
}> {
  return new Promise((resolve, reject) => {
    forge.pki.rsa.generateKeyPair(
      { bits: 2048, workers: 2 },
      (err, keypair) => {
        if (err) {
          return reject(err);
        }
        resolve({
          publicKey: forge.pki.publicKeyToPem(keypair.publicKey),
          privateKey: forge.pki.privateKeyToPem(keypair.privateKey),
        });
      }
    );
  });
}

/**
 * Creates a self-signed Root CA certificate.
 */
export function createRootCA(
  privateKeyPem: string,
  publicKeyPem: string,
  organizationName: string = "Niko System Root CA"
): string {
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

  const cert = forge.pki.createCertificate();
  cert.publicKey = publicKey;
  cert.serialNumber = "01";
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(
    cert.validity.notBefore.getFullYear() + 10
  ); // 10 years

  const attrs = [
    { name: "commonName", value: organizationName },
    { name: "organizationName", value: "Ministry of Health" },
    { name: "countryName", value: "NP" },
  ];

  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.setExtensions([
    { name: "basicConstraints", cA: true },
    {
      name: "keyUsage",
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true,
    },
  ]);

  // Sign self-signed cert
  cert.sign(privateKey, forge.md.sha256.create());

  return forge.pki.certificateToPem(cert);
}

/**
 * Issues a certificate for a hospital (Intermediate CA or End Entity), signed by the Root CA.
 */
export function issueHospitalCertificate(
  hospitalPublicKeyPem: string,
  rootPrivateKeyPem: string,
  rootCertPem: string,
  hospitalDetails: { name: string; id: string }
): string {
  const rootPrivateKey = forge.pki.privateKeyFromPem(rootPrivateKeyPem);
  const rootCert = forge.pki.certificateFromPem(rootCertPem);
  const hospitalPublicKey = forge.pki.publicKeyFromPem(hospitalPublicKeyPem);

  const cert = forge.pki.createCertificate();
  cert.publicKey = hospitalPublicKey;
  cert.serialNumber = hospitalDetails.id.replace(/-/g, "").substring(0, 16); // Simple serial from UUID
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1); // 1 year validity

  const attrs = [
    { name: "commonName", value: hospitalDetails.name },
    { name: "organizationName", value: hospitalDetails.name },
    { name: "countryName", value: "NP" },
    { name: "serialNumber", value: hospitalDetails.id },
  ];

  cert.setSubject(attrs);
  cert.setIssuer(rootCert.subject.attributes);
  cert.setExtensions([
    { name: "basicConstraints", cA: false }, // Hospital is end entity for signing reports, or maybe CA if they sign doctors? For now false.
    {
      name: "keyUsage",
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true,
    },
  ]);

  cert.sign(rootPrivateKey, forge.md.sha256.create());

  return forge.pki.certificateToPem(cert);
}

/**
 * Signs data (string) using a private key.
 * Returns signature in Base64 format.
 */
export function signData(data: string, privateKeyPem: string): string {
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const md = forge.md.sha256.create();
  md.update(data, "utf8");
  const signature = privateKey.sign(md);
  return forge.util.encode64(signature);
}

/**
 * Verifies a signature for a given data string using a public key.
 */
export function verifySignature(
  data: string,
  signatureBase64: string,
  publicKeyPem: string
): boolean {
  try {
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
    const md = forge.md.sha256.create();
    md.update(data, "utf8");
    const signature = forge.util.decode64(signatureBase64);
    return publicKey.verify(md.digest().bytes(), signature);
  } catch (e) {
    console.error("Verification failed:", e);
    return false;
  }
}

/**
 * Hashes data using SHA-256 and returns hex string.
 */
export function hashData(data: string): string {
  const md = forge.md.sha256.create();
  md.update(data, "utf8");
  return md.digest().toHex();
}
