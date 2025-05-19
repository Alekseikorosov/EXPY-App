import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  Space,
  Typography,
  Button,
  Modal,
  Dropdown,
  Menu,
  Checkbox
} from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import {jwtDecode} from 'jwt-decode';
import axios from '../utils/axiosInstance';
import CategoriesModal from './CategoriesModal';
import '../styles/AdminDashboard.css';


const { Text } = Typography;

const AdminDashboard = ({ searchTerm = '' }) => {
  const [view, setView] = useState('quizzes');
  const [modal, contextHolder] = Modal.useModal();

  // Получаем текущего пользователя
  let currentUserId = null;
  try {
    const token = localStorage.getItem('accessToken');
    if (token) currentUserId = jwtDecode(token).id;
  } catch (_) { /* ignore */ }

  // State для quizzes
  const [quizzes, setQuizzes] = useState([]);
  const [quizPage, setQuizPage] = useState(1);
  const [quizTotal, setQuizTotal] = useState(0);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [selectedQuizKeys, setSelectedQuizKeys] = useState([]);

    /* ---- categories filter (только для view === 'quizzes') ---- */
  const [selectedCategories, setSelectedCategories] = useState([]);   // [{id, name}, …]
  const [isCatModalOpen, setIsCatModalOpen]   = useState(false);
  

  // State для users
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserKeys, setSelectedUserKeys] = useState([]);

  const PAGE_SIZE = 10;

  // Fetch quizzes
  const fetchQuizzes = async (page = 1) => {
    setLoadingQuizzes(true);
    try {
      const { data } = await axios.get('/quizzes', {
        params: { page, limit: PAGE_SIZE }
      });
      setQuizzes(data.quizzes || []);
      setQuizTotal(data.total || 0);
      setQuizPage(data.page || page);
      setSelectedQuizKeys([]);
    } catch (err) {
      modal.error({ title: 'Error', content: err.message, centered: true });
    } finally {
      setLoadingQuizzes(false);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await axios.get('/users');
      setUsers(data);
      setSelectedUserKeys([]);
    } catch (err) {
      modal.error({ title: 'Error', content: err.message, centered: true });
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (view === 'quizzes') {
      fetchQuizzes(quizPage);
    } else {
      fetchUsers();
    }
  }, [view]);

  // Delete handlers
  const deleteQuiz = record => {
    modal.confirm({
      title: 'Confirm deletion',
      content: `Delete quiz "${record.title}"?`,
      okType: 'danger',
      centered: true,
      onOk: async () => {
        await axios.delete(`/admin/quizzes/${record.id}`);
        fetchQuizzes(quizPage);
      }
    });
  };

  const deleteUser = record => {
    modal.confirm({
      title: 'Confirm deletion',
      content: `Delete user "${record.username}"?`,
      okType: 'danger',
      centered: true,
      onOk: async () => {
        await axios.delete(`/admin/users/${record.id}`);
        fetchUsers();
      }
    });
  };

  // Bulk delete
  const handleBulkDeleteQuizzes = () => {
    modal.confirm({
      title: 'Confirm bulk deletion',
      content: `Delete ${selectedQuizKeys.length} quizzes?`,
      okType: 'danger',
      centered: true,
      onOk: async () => {
        await Promise.all(
          selectedQuizKeys.map(id => axios.delete(`/admin/quizzes/${id}`))
        );
        fetchQuizzes(quizPage);
      }
    });
  };

  const handleBulkDeleteUsers = () => {
    modal.confirm({
      title: 'Confirm bulk deletion',
      content: `Delete ${selectedUserKeys.length} users?`,
      okType: 'danger',
      centered: true,
      onOk: async () => {
        await Promise.all(
          selectedUserKeys.map(id => axios.delete(`/admin/users/${id}`))
        );
        fetchUsers();
      }
    });
  };

  // Формат даты
  const formatDate = iso => {
    const d = new Date(iso);
    return (
      d.toLocaleDateString() +
      ' ' +
      d.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
      })
    );
  };

  // Колонки для quizzes
  const quizColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', sorter: (a, b) => a.id - b.id },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
   ellipsis: {           // <–– включаем обрезку и тултип
     showTitle: true     // showTitle: true добавит стандартный HTML-title
   },
    },
    {
      title: 'Category',
      dataIndex: ['category', 'name'],
      key: 'category',
      sorter: (a, b) =>
        a.category.name.localeCompare(b.category.name)
    },
    {
      title: 'Creator',
      dataIndex: ['creator', 'username'],
      key: 'creator',
      sorter: (a, b) =>
        a.creator.username.localeCompare(b.creator.username)
    },
    {
      title: 'Questions',
      dataIndex: 'question_quantity',
      key: 'question_quantity',
      sorter: (a, b) => a.question_quantity - b.question_quantity
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: text => formatDate(text),
      sorter: (a, b) =>
        new Date(a.created_at) - new Date(b.created_at)
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, rec) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="delete" onClick={() => deleteQuiz(rec)}>
                Delete
              </Menu.Item>
            </Menu>
          }
          trigger={['click']}
        >
          <Button type="text" icon={<EllipsisOutlined />} />
        </Dropdown>
      )
    }
  ];

  // Колонки для users
  const userColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', sorter: (a, b) => a.id - b.id },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username)
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Telephone', dataIndex: 'telephone', key: 'telephone' },
    {
      title: 'Last Login',
      dataIndex: 'last_login',
      key: 'last_login',
      render: text => formatDate(text),
      sorter: (a, b) =>
        new Date(a.last_login) - new Date(b.last_login)
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: text => formatDate(text),
      sorter: (a, b) =>
        new Date(a.created_at) - new Date(b.created_at)
    },
    {
      title: 'Updated At',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: text => formatDate(text),
      sorter: (a, b) =>
        new Date(a.updated_at) - new Date(b.updated_at)
    },
    {
      title: 'Fuel',
      dataIndex: 'fuel',
      key: 'fuel',
      sorter: (a, b) => a.fuel - b.fuel,
      render: val => {
        let color = 'green';
        if (val < 20) color = 'red';
        else if (val < 100) color = 'orange';
        return <Text style={{ color }}>{val}</Text>;
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, rec) =>
        rec.role === 'admin' || rec.id === currentUserId ? (
          <Text disabled>Delete</Text>
        ) : (
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="delete" onClick={() => deleteUser(rec)}>
                  Delete
                </Menu.Item>
              </Menu>
            }
            trigger={['click']}
          >
            <Button type="text" icon={<EllipsisOutlined />} />
          </Dropdown>
        )
    }
  ];

  // Отфильтрованные данные
  const filteredQuizzes = quizzes.filter(q => {
      // 1) поиск
      const matchesSearch =
        !searchTerm ||
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.creator?.username.toLowerCase().includes(searchTerm.toLowerCase());
    
      // 2) категории
      const catKeys = selectedCategories.map(c => c.id ?? c.name);
      const matchesCategory =
        catKeys.length === 0
          ? true
          : catKeys.includes(q.category?.id ?? q.category?.name);
  
      return matchesSearch && matchesCategory;
    });



  const filteredUsers = users.filter(u =>
    !searchTerm
      ? true
      : u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Выбираемые строки и логика “Select All”
  const data = view === 'quizzes' ? filteredQuizzes : filteredUsers;
  const selectedKeys = view === 'quizzes' ? selectedQuizKeys : selectedUserKeys;
  const setSelectedKeys =
    view === 'quizzes' ? setSelectedQuizKeys : setSelectedUserKeys;

  // Разрешённые к выбору user-строки (без админов и себя)
  const allowedRows =
    view === 'quizzes'
      ? data
      : data.filter(
          r => r.role !== 'admin' && r.id !== currentUserId
        );

  const rowSelection = {
    columnTitle: () => (
      <Checkbox
        checked={selectedKeys.length === allowedRows.length && allowedRows.length > 0}
        onChange={e => {
          if (e.target.checked) {
            setSelectedKeys(allowedRows.map(r => r.id));
          } else {
            setSelectedKeys([]);
          }
        }}
      />
    ),
    type: 'checkbox',
    selectedRowKeys: selectedKeys,
    onChange: keys => setSelectedKeys(keys),
    getCheckboxProps: record => ({
      disabled:
        view === 'users' &&
        (record.role === 'admin' || record.id === currentUserId)
    })
  };

  const onRow = record => {
    const disabledRow =
      view === 'users' &&
      (record.role === 'admin' || record.id === currentUserId);
    return {
      onClick: () => {
        if (disabledRow) return;
        const next = [...selectedKeys];
        const idx = next.indexOf(record.id);
        if (idx >= 0) next.splice(idx, 1);
        else next.push(record.id);
        setSelectedKeys(next);
      }
    };
  };

  return (
    <div style={{ padding: 16 }}>
      {contextHolder}
      <div style={{ overflowX: 'auto', width: '100%' }}>
      <Space
  style={{
    width: '100%',
    marginBottom: 16,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap'
  }}
>
  {/* ← Левая часть: переключатель Quizzes/Users */}
  <Space>
    <Text
      strong
      style={{ cursor: 'pointer', color: view === 'quizzes' ? '#1890ff' : undefined }}
      onClick={() => setView('quizzes')}
    >
      Quizzes
    </Text>
    <Text
      strong
      style={{ cursor: 'pointer', color: view === 'users' ? '#1890ff' : undefined }}
      onClick={() => setView('users')}
    >
      Users
    </Text>
  </Space>

  {/* → Правая часть: здесь всегда будет кнопка справа */}
  {view === 'quizzes' && (
    <Space>
      <Button onClick={() => setIsCatModalOpen(true)}>Categories</Button>
      {selectedCategories.length > 0 && (
        <Button onClick={() => setSelectedCategories([])}>Clear categories</Button>
      )}
      {selectedQuizKeys.length > 0 && (
        <Button type="primary" danger onClick={handleBulkDeleteQuizzes}>
          Delete selected ({selectedQuizKeys.length})
        </Button>
      )}
    </Space>
  )}
  {view === 'users' && selectedUserKeys.length > 0 && (
    <Space>
      <Button type="primary" danger onClick={handleBulkDeleteUsers}>
        Delete selected ({selectedUserKeys.length})
      </Button>
    </Space>
  )}
</Space>


{/* ──────────────────────────────────────────────────────────── */}

  

      {/* таблица данных */}
      <Table
        className="selectable-table"
        columns={view === 'quizzes' ? quizColumns : userColumns}
        dataSource={data}
        rowKey="id"
        loading={view === 'quizzes' ? loadingQuizzes : loadingUsers}
        pagination={
          view === 'quizzes'
          ? {
          current: quizPage,
          pageSize: PAGE_SIZE,
          total: quizTotal,
          onChange: fetchQuizzes
          }
          : { pageSize: PAGE_SIZE }
          }
        rowSelection={rowSelection}
        onRow={onRow}
        scroll={{ x: 'max-content' }}
        locale={{ emptyText: <span>No data</span> }}
      />
    </div>

      {/* модалка выбора категорий */}
      {view === 'quizzes' && (
  <CategoriesModal
    isOpen={isCatModalOpen}
    onClose={() => setIsCatModalOpen(false)}
    onAddCategories={setSelectedCategories}
    alreadySelected={selectedCategories}
    /* если нужно, можете убрать проп completely —
       тогда modal сама сделает GET /categories */
    availableCategories={Array.from(
      new Map(
      quizzes.filter(q => q.category)
            .map(q => {
              const key = q.category.id ?? q.category.name;   // <──
              return [key, { id: key, name: q.category.name }];
            })
      ).values()
          )}
        />
      )}
    </div>
  );

};

AdminDashboard.propTypes = {
  searchTerm: PropTypes.string
};

export default AdminDashboard;
