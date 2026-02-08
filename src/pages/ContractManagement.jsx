import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminTable from '../components/AdminTable';
import AxiosClient from '../AxiosClient';
import { useUserContext } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePopup } from '../contexts/PopupContext';

function ContractManagement() {
  const { t, translateStatus } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setMessage } = useUserContext();
  const { showConfirm } = usePopup();
  const highlightedId = searchParams.get('contractId');

  useEffect(() => {
    fetchContracts();
  }, []);

  useEffect(() => {
    if (highlightedId && contracts.length > 0) {
      setTimeout(() => {
        const element = document.getElementById(`row-${highlightedId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [highlightedId, contracts]);

  const fetchContracts = () => {
    setLoading(true);
    AxiosClient.get('/admin/contracts')
      .then((response) => {
        setContracts(response.data.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching contracts:', error);
        setLoading(false);
      });
  };

  const handleStatusUpdate = (contract, newStatus) => {
    AxiosClient.patch(`/admin/contracts/${contract.id}/status`, { status: newStatus })
      .then(() => {
        setMessage(
          t('admin.contracts') +
            ' ' +
            t('admin.status') +
            ' ' +
            translateStatus(newStatus) +
            ' ' +
            t('common.success')
        );
        fetchContracts();
      })
      .catch((error) => {
        console.error('Error updating contract status:', error);
        setMessage(t('admin.errorUpdatingContract'), 'error');
      });
  };

  const columns = [
    {
      key: 'user',
      label: t('admin.tenant'),
      render: (value, row) => (row.user ? row.user.name : 'N/A'),
    },
    {
      key: 'post',
      label: t('admin.apartment'),
      render: (value, row) => (row.post ? row.post.Title : 'N/A'),
    },
    {
      key: 'start_date',
      label: t('admin.startDate'),
      render: (value) => (value ? new Date(value).toLocaleDateString() : 'N/A'),
    },
    {
      key: 'end_date',
      label: t('admin.endDate'),
      render: (value) => (value ? new Date(value).toLocaleDateString() : 'N/A'),
    },
    {
      key: 'status',
      label: t('admin.status'),
      render: (value) => {
        const statusColors = {
          active: 'bg-green-200',
          expired: 'bg-gray-200',
          cancelled: 'bg-red-200',
        };
        return (
          <span className={`px-2 py-1 rounded-md text-sm ${statusColors[value] || 'bg-gray-200'}`}>
            {translateStatus(value)}
          </span>
        );
      },
    },
  ];

  const handleDelete = async (contract) => {
    const confirmed = await showConfirm({
      title: t('admin.delete') + ' ' + t('admin.contracts'),
      message: `${t('admin.delete')} ${t('admin.contracts')}? ${t('admin.confirmDelete') || 'This action cannot be undone.'}`,
      confirmText: t('admin.delete'),
      cancelText: t('admin.cancel'),
      variant: 'danger',
    });

    if (confirmed) {
      AxiosClient.delete(`/admin/contracts/${contract.id}`)
        .then(() => {
          setMessage(
            t('admin.contracts') +
              ' ' +
              t('admin.deleted') +
              ' ' +
              t('common.success')
          );
          fetchContracts();
        })
        .catch((error) => {
          console.error('Error deleting contract:', error);
          setMessage(t('admin.errorDeletingContract') || 'Error deleting contract', 'error');
        });
    }
  };

  const actions = (contract) => {
    const actionButtons = [];
    if (contract.status === 'active') {
      actionButtons.push({
        label: t('admin.disable'),
        onClick: () => handleStatusUpdate(contract, 'cancelled'),
        variant: 'danger',
      });
    }
    actionButtons.push({
      label: t('admin.delete'),
      onClick: () => handleDelete(contract),
      variant: 'danger',
    });
    return actionButtons;
  };

  const handleRowClick = (contract) => {
    navigate(`/contracts/${contract.id}`);
  };

  return (
    <div className="px-5 mx-auto max-w-[1366px]">
      <h1 className="text-3xl font-bold text-[#444] mb-8">{t('admin.contracts')}</h1>
      <AdminTable 
        columns={columns} 
        data={contracts} 
        actions={actions} 
        loading={loading}
        onRowClick={handleRowClick}
        highlightedRowId={highlightedId}
      />
    </div>
  );
}

export default ContractManagement;

