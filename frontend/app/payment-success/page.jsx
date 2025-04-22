'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const PaymentSuccess = () => {
  const router = useRouter();

  useEffect(() => {
    // After 10s auto‑return with the chatOpen flag
    const timeout = setTimeout(() => {
      router.push('/?chatOpen=true');
    }, 10000);
    return () => clearTimeout(timeout);
  }, [router]);

  const handleBack = () => {
    router.push('/?chatOpen=true');
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>✅ Payment Successful!</h2>
        <p style={styles.message}>Thank you for your order 🎉</p>
        <button style={styles.button} onClick={handleBack}>
          ← Back to Chat
        </button>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
    textAlign: 'center',
    width: '90%',
    maxWidth: '400px',
  },
  title: {
    fontSize: '22px',
    marginBottom: '10px',
  },
  message: {
    fontSize: '16px',
    marginBottom: '20px',
  },
  button: {
    padding: '10px 20px',
    borderRadius: '8px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
  },
};

export default PaymentSuccess;
