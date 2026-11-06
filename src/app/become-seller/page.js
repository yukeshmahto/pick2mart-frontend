'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sellerService } from '../../services/seller.service';
import { userService } from '../../services/user.service';
import styles from './page.module.css';

export default function BecomeSeller() {
  const [formData, setFormData] = useState({
    companyName: '',
    description: '',
    taxId: '',
    businessAddress: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login?redirect=/become-seller');
        return;
      }
      try {
        const response = await userService.getProfile();
        if (response.success) {
          if (response.data.role === 'seller') {
            setSuccess(true);
          }
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await sellerService.createProfile(formData);
      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message || 'Failed to submit application');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.successIcon}>✓</div>
          <h1 className={styles.title}>Application Submitted!</h1>
          <p className={styles.subtitle}>
            Your application to become a seller has been received. 
            An admin will review your details shortly.
          </p>
          <button className={styles.submitBtn} onClick={() => router.push('/')}>
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Become a Seller</h1>
        <p className={styles.subtitle}>
          Join Pick 2 Mart and start selling your products to thousands of customers!
        </p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="companyName">Company Name</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              placeholder="e.g. Acme Corporation"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="taxId">Tax ID / GSTIN</label>
            <input
              type="text"
              id="taxId"
              name="taxId"
              value={formData.taxId}
              onChange={handleChange}
              required
              placeholder="Your business tax identification number"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="businessAddress">Business Address</label>
            <textarea
              id="businessAddress"
              name="businessAddress"
              value={formData.businessAddress}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Full registered business address"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Business Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Tell us about the products you intend to sell..."
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}
