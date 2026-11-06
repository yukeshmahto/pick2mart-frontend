'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Truck,
  Package,
  Users,
  AlertTriangle,
  CheckCircle,
  Plus,
  RefreshCw,
  Search,
  UserCheck,
  UserX,
  X,
  ExternalLink,
} from 'lucide-react';
import { deliveryService } from '../../services/delivery.service';

export default function DeliveriesTab() {
  const [activeSection, setActiveSection] = useState('eligible');
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState([]);
  const [eligibleOrders, setEligibleOrders] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [toast, setToast] = useState(null);

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignSubOrder, setAssignSubOrder] = useState(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');

  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignAssignment, setReassignAssignment] = useState(null);
  const [newPartnerId, setNewPartnerId] = useState('');
  const [reassignReason, setReassignReason] = useState('');

  const [showCreatePartnerModal, setShowCreatePartnerModal] = useState(false);
  const [newPartnerForm, setNewPartnerForm] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    vehicleType: 'Motorcycle',
    vehicleNumber: '',
  });

  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [partnersRes, eligibleRes, assignmentsRes] = await Promise.all([
        deliveryService.getPartnersAdmin(),
        deliveryService.getEligibleOrdersAdmin(),
        deliveryService.getAllAssignmentsAdmin(),
      ]);

      if (partnersRes.success) setPartners(partnersRes.data || []);
      if (eligibleRes.success) setEligibleOrders(eligibleRes.data || []);
      if (assignmentsRes.success) setAssignments(assignmentsRes.data || []);
    } catch (err) {
      console.error('Failed to load admin delivery data:', err);
      showToast('Error fetching delivery data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleTogglePartnerStatus = async (userId, currentStatus) => {
    try {
      await deliveryService.updatePartnerStatusAdmin(userId, !currentStatus);
      showToast(`Partner ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      await loadAll();
    } catch (err) {
      showToast(err.message || 'Failed to update partner status', 'error');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignSubOrder || !selectedPartnerId) {
      showToast('Please select a delivery partner', 'error');
      return;
    }

    setActionLoading(true);
    try {
      await deliveryService.assignDeliveryAdmin({
        sellerOrderId: assignSubOrder._id,
        deliveryPartnerId: selectedPartnerId,
        notes: assignNotes.trim(),
      });
      showToast('Delivery partner assigned successfully!');
      setShowAssignModal(false);
      setAssignSubOrder(null);
      setSelectedPartnerId('');
      setAssignNotes('');
      await loadAll();
    } catch (err) {
      showToast(err.message || 'Assignment failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!reassignAssignment || !newPartnerId) {
      showToast('Please select a new delivery partner', 'error');
      return;
    }
    if (!reassignReason.trim() || reassignReason.trim().length < 5) {
      showToast('Please provide a reason (at least 5 characters)', 'error');
      return;
    }

    setActionLoading(true);
    try {
      await deliveryService.reassignDeliveryAdmin(reassignAssignment._id, {
        newDeliveryPartnerId: newPartnerId,
        reason: reassignReason.trim(),
      });
      showToast('Delivery reassigned successfully!');
      setShowReassignModal(false);
      setReassignAssignment(null);
      setNewPartnerId('');
      setReassignReason('');
      await loadAll();
    } catch (err) {
      showToast(err.message || 'Reassignment failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreatePartnerSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await deliveryService.createPartnerAdmin(newPartnerForm);
      showToast('Delivery partner registered successfully!');
      setShowCreatePartnerModal(false);
      setNewPartnerForm({
        fullName: '',
        email: '',
        mobile: '',
        password: '',
        vehicleType: 'Motorcycle',
        vehicleNumber: '',
      });
      await loadAll();
    } catch (err) {
      showToast(err.message || 'Failed to register partner', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const activeDeliveries = assignments.filter((a) =>
    ['ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(a.status),
  );
  const failedDeliveries = assignments.filter((a) => a.status === 'FAILED_DELIVERY');

  return (
    <div style={{ color: '#0f172a' }}>
      {/* Toast Alert */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: toast.type === 'error' ? '#ef4444' : '#0d9488',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            zIndex: 9999,
            fontWeight: '600',
            fontSize: '14px',
          }}
        >
          {toast.message}
        </div>
      )}

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            padding: '18px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
            FLEET PARTNERS
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>
            {partners.length}
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            padding: '18px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
            UNASSIGNED SHIPMENTS
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#eab308', marginTop: '6px' }}>
            {eligibleOrders.length}
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            padding: '18px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
            ACTIVE TRIPS IN TRANSIT
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0284c7', marginTop: '6px' }}>
            {activeDeliveries.length}
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            padding: '18px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
            FAILED ATTEMPTS QUEUE
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#ef4444', marginTop: '6px' }}>
            {failedDeliveries.length}
          </div>
        </div>
      </div>

      {/* Sub-Navigation & Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {[
            { id: 'eligible', label: `Ready to Dispatch (${eligibleOrders.length})` },
            { id: 'active', label: `Active Deliveries (${activeDeliveries.length})` },
            { id: 'partners', label: `Delivery Partners (${partners.length})` },
            { id: 'failed', label: `Failed Queue (${failedDeliveries.length})` },
            { id: 'all', label: `All History (${assignments.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                background: activeSection === tab.id ? '#0f172a' : '#f1f5f9',
                color: activeSection === tab.id ? '#ffffff' : '#64748b',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowCreatePartnerModal(true)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              background: '#0d9488',
              color: '#ffffff',
              border: 'none',
              fontWeight: '600',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <Plus size={16} /> Register Partner
          </button>

          <button
            onClick={loadAll}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* SECTION 1: ELIGIBLE SUB-ORDERS */}
      {activeSection === 'eligible' && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>
              Sub-Orders Ready for Courier Assignment
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
              Vendors have confirmed and processed these sub-orders. Assign an available delivery partner to dispatch.
            </p>
          </div>

          {eligibleOrders.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              No orders currently waiting for delivery assignment.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px' }}>Sub-Order ID</th>
                    <th style={{ padding: '12px 16px' }}>Master Order</th>
                    <th style={{ padding: '12px 16px' }}>Seller Store</th>
                    <th style={{ padding: '12px 16px' }}>Destination</th>
                    <th style={{ padding: '12px 16px' }}>Items</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {eligibleOrders.map((so) => (
                    <tr key={so._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '700' }}>
                        {so.sellerOrderId}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>
                        {so.masterOrderId?.orderNumber || 'N/A'}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '600' }}>
                        {so.sellerId?.storeName || 'Vendor'}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>
                        {so.masterOrderId?.shippingAddress?.city},{' '}
                        {so.masterOrderId?.shippingAddress?.pincode}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {so.items?.length || 0} product(s)
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            background: '#fef3c7',
                            color: '#b45309',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontWeight: '700',
                            fontSize: '11px',
                          }}
                        >
                          {so.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => {
                            setAssignSubOrder(so);
                            setShowAssignModal(true);
                          }}
                          style={{
                            padding: '6px 12px',
                            background: '#0d9488',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '12px',
                          }}
                        >
                          Assign Partner
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: ACTIVE DELIVERIES */}
      {activeSection === 'active' && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>
              Active Shipments in Transit
            </h3>
          </div>

          {activeDeliveries.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              No active deliveries in transit right now.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px' }}>Tracking #</th>
                    <th style={{ padding: '12px 16px' }}>Order</th>
                    <th style={{ padding: '12px 16px' }}>Assigned Partner</th>
                    <th style={{ padding: '12px 16px' }}>Stage</th>
                    <th style={{ padding: '12px 16px' }}>Destination</th>
                    <th style={{ padding: '12px 16px' }}>Assigned At</th>
                    <th style={{ padding: '12px 16px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeDeliveries.map((assignment) => (
                    <tr key={assignment._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: '700' }}>
                        {assignment.trackingNumber || 'N/A'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {assignment.masterOrderId?.orderNumber || 'N/A'}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '600' }}>
                        {assignment.deliveryPartnerId?.fullName}
                        <br />
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          {assignment.deliveryPartnerId?.mobile}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontWeight: '700',
                            fontSize: '11px',
                            background:
                              assignment.status === 'OUT_FOR_DELIVERY'
                                ? '#f3e8ff'
                                : assignment.status === 'PICKED_UP'
                                  ? '#fef3c7'
                                  : '#e0f2fe',
                            color:
                              assignment.status === 'OUT_FOR_DELIVERY'
                                ? '#9333ea'
                                : assignment.status === 'PICKED_UP'
                                  ? '#d97706'
                                  : '#0284c7',
                          }}
                        >
                          {assignment.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>
                        {assignment.masterOrderId?.shippingAddress?.city}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>
                        {assignment.assignedAt ? new Date(assignment.assignedAt).toLocaleDateString() : ''}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => {
                            setReassignAssignment(assignment);
                            setShowReassignModal(true);
                          }}
                          style={{
                            padding: '4px 8px',
                            background: '#f1f5f9',
                            color: '#475569',
                            border: '1px solid #cbd5e1',
                            borderRadius: '4px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '11px',
                          }}
                        >
                          Reassign
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: PARTNERS & FLEET */}
      {activeSection === 'partners' && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>
              Fleet Executives & Couriers
            </h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px' }}>Executive Name</th>
                  <th style={{ padding: '12px 16px' }}>Email</th>
                  <th style={{ padding: '12px 16px' }}>Mobile</th>
                  <th style={{ padding: '12px 16px' }}>Vehicle</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Completed</th>
                  <th style={{ padding: '12px 16px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => (
                  <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '700' }}>
                      {p.fullName}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>
                      {p.email}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {p.mobile}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {p.profile?.vehicleType || 'Motorcycle'}{' '}
                      <span style={{ color: '#64748b', fontSize: '11px' }}>
                        {p.profile?.vehicleNumber ? `(${p.profile.vehicleNumber})` : ''}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          background: p.isActive ? '#dcfce7' : '#fee2e2',
                          color: p.isActive ? '#166534' : '#991b1b',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontWeight: '700',
                          fontSize: '11px',
                        }}
                      >
                        {p.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '700' }}>
                      {p.profile?.totalDeliveredCount || 0}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => handleTogglePartnerStatus(p._id, p.isActive)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          background: p.isActive ? '#fee2e2' : '#dcfce7',
                          color: p.isActive ? '#991b1b' : '#166534',
                          border: 'none',
                        }}
                      >
                        {p.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 4: FAILED QUEUE */}
      {activeSection === 'failed' && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#ef4444' }}>
              Failed Deliveries Awaiting Resolution
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
              These shipments encountered doorstep delivery failures. Reassign them to another delivery partner or reschedule.
            </p>
          </div>

          {failedDeliveries.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              No failed delivery attempts in the queue.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px' }}>Order Number</th>
                    <th style={{ padding: '12px 16px' }}>Partner</th>
                    <th style={{ padding: '12px 16px' }}>Failure Reason</th>
                    <th style={{ padding: '12px 16px' }}>Destination</th>
                    <th style={{ padding: '12px 16px' }}>Failed At</th>
                    <th style={{ padding: '12px 16px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {failedDeliveries.map((assignment) => (
                    <tr key={assignment._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '700' }}>
                        {assignment.masterOrderId?.orderNumber || 'N/A'}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '600' }}>
                        {assignment.deliveryPartnerId?.fullName}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#ef4444', fontWeight: '600' }}>
                        {assignment.failureReason}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>
                        {assignment.masterOrderId?.shippingAddress?.city}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>
                        {assignment.failedAt ? new Date(assignment.failedAt).toLocaleString() : ''}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => {
                            setReassignAssignment(assignment);
                            setShowReassignModal(true);
                          }}
                          style={{
                            padding: '6px 12px',
                            background: '#0d9488',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: '600',
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          Reassign Partner
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECTION 5: ALL HISTORY */}
      {activeSection === 'all' && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>
              Full Delivery Assignment History & Audit Trail
            </h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px' }}>Tracking #</th>
                  <th style={{ padding: '12px 16px' }}>Order Number</th>
                  <th style={{ padding: '12px 16px' }}>Delivery Partner</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Assigned Date</th>
                  <th style={{ padding: '12px 16px' }}>Delivered Date</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>
                      {assignment.trackingNumber || 'N/A'}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '700' }}>
                      {assignment.masterOrderId?.orderNumber || 'N/A'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {assignment.deliveryPartnerId?.fullName}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontWeight: '700',
                          fontSize: '11px',
                          background:
                            assignment.status === 'DELIVERED'
                              ? '#dcfce7'
                              : assignment.status === 'FAILED_DELIVERY'
                                ? '#fee2e2'
                                : '#f1f5f9',
                          color:
                            assignment.status === 'DELIVERED'
                              ? '#166534'
                              : assignment.status === 'FAILED_DELIVERY'
                                ? '#991b1b'
                                : '#475569',
                        }}
                      >
                        {assignment.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>
                      {assignment.assignedAt ? new Date(assignment.assignedAt).toLocaleDateString() : ''}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>
                      {assignment.deliveredAt ? new Date(assignment.deliveredAt).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN PARTNER */}
      {showAssignModal && assignSubOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
                Assign Delivery Partner
              </h3>
              <button
                onClick={() => setShowAssignModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Sub-Order: <strong>{assignSubOrder.sellerOrderId}</strong> (Master: {assignSubOrder.masterOrderId?.orderNumber})
            </p>

            <form onSubmit={handleAssignSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  Select Active Delivery Executive *
                </label>
                <select
                  value={selectedPartnerId}
                  onChange={(e) => setSelectedPartnerId(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                  }}
                >
                  <option value="">-- Choose Partner --</option>
                  {partners
                    .filter((p) => p.isActive)
                    .map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.fullName} ({p.profile?.vehicleType || 'Motorcycle'} - {p.mobile})
                      </option>
                    ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  Dispatch Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fragile items, deliver before 6 PM"
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#f1f5f9',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    background: '#0d9488',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '700',
                  }}
                >
                  {actionLoading ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REASSIGN PARTNER */}
      {showReassignModal && reassignAssignment && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
                Reassign Delivery Task
              </h3>
              <button
                onClick={() => setShowReassignModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Currently assigned to: <strong>{reassignAssignment.deliveryPartnerId?.fullName}</strong>
            </p>

            <form onSubmit={handleReassignSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  Select New Delivery Partner *
                </label>
                <select
                  value={newPartnerId}
                  onChange={(e) => setNewPartnerId(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                  }}
                >
                  <option value="">-- Choose New Courier --</option>
                  {partners
                    .filter((p) => p.isActive && p._id !== reassignAssignment.deliveryPartnerId?._id)
                    .map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.fullName} ({p.profile?.vehicleType || 'Motorcycle'})
                      </option>
                    ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  Audited Reassignment Reason *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Courier vehicle breakdown / Customer requested reschedule"
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowReassignModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#f1f5f9',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    background: '#0d9488',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '700',
                  }}
                >
                  {actionLoading ? 'Reassigning...' : 'Confirm Reassignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE PARTNER */}
      {showCreatePartnerModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
                Register Delivery Partner
              </h3>
              <button
                onClick={() => setShowCreatePartnerModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePartnerSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPartnerForm.fullName}
                    onChange={(e) => setNewPartnerForm({ ...newPartnerForm, fullName: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                    Mobile Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPartnerForm.mobile}
                    onChange={(e) => setNewPartnerForm({ ...newPartnerForm, mobile: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newPartnerForm.email}
                  onChange={(e) => setNewPartnerForm({ ...newPartnerForm, email: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                  Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPartnerForm.password}
                  onChange={(e) => setNewPartnerForm({ ...newPartnerForm, password: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                    Vehicle Type
                  </label>
                  <select
                    value={newPartnerForm.vehicleType}
                    onChange={(e) => setNewPartnerForm({ ...newPartnerForm, vehicleType: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  >
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Electric Scooter">Electric Scooter</option>
                    <option value="Bicycle">Bicycle</option>
                    <option value="Van">Van / Mini-Truck</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                    Vehicle Number
                  </label>
                  <input
                    type="text"
                    placeholder="MH-02-AB-1234"
                    value={newPartnerForm.vehicleNumber}
                    onChange={(e) => setNewPartnerForm({ ...newPartnerForm, vehicleNumber: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreatePartnerModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '6px', background: '#f1f5f9', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{ padding: '8px 18px', borderRadius: '6px', background: '#0d9488', color: '#ffffff', border: 'none', cursor: 'pointer', fontWeight: '700' }}
                >
                  {actionLoading ? 'Creating...' : 'Register Executive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
