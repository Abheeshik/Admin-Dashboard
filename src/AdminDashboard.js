// AdminDashboard.js

import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingRow, setEditingRow] = useState(null);

  const usersPerPage = 10;

  // Fetch data from the API
  useEffect(() => {
    fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json')
      .then(response => response.json())
      .then(data => {
        setUsers(data);
        setFilteredUsers(data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  // Handle search
  useEffect(() => {
    const filtered = users.filter(user =>
      Object.values(user).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, users]);

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Handle row selection
  const handleRowSelection = (userId) => {
    const isSelected = selectedRows.includes(userId);
    if (isSelected) {
      setSelectedRows(selectedRows.filter(id => id !== userId));
    } else {
      setSelectedRows([...selectedRows, userId]);
    }
  };

  // Handle select/deselect all rows on the current page
  const handleSelectAll = () => {
    const allIdsOnPage = currentUsers.map(user => user.id);
    const areAllSelected = allIdsOnPage.every(id => selectedRows.includes(id));
    if (areAllSelected) {
      setSelectedRows(selectedRows.filter(id => !allIdsOnPage.includes(id)));
    } else {
      setSelectedRows([...selectedRows, ...allIdsOnPage]);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    const updatedUsers = users.filter(user => !selectedRows.includes(user.id));
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers);
    setSelectedRows([]);
  };

  // Handle row edit
  const handleEdit = (userId) => {
    setEditingRow(userId);
  };

  // Handle save after editing
  const handleSave = () => {
    setEditingRow(null);
  };

  // Handle row deletion
  const handleDelete = (userId) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers);
    setSelectedRows(selectedRows.filter(id => id !== userId));
  };

  return (
    <div className="admin-dashboard">
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <table>
        {/* Table headers */}
        <thead>
          <tr>
            <th>
              <input type="checkbox" onChange={handleSelectAll} />
            </th>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        {/* Table body */}
        <tbody>
          {currentUsers.map(user => (
            <tr key={user.id} className={selectedRows.includes(user.id) ? 'selected' : ''}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedRows.includes(user.id)}
                  onChange={() => handleRowSelection(user.id)}
                />
              </td>
              <td>{user.id}</td>
              <td>{editingRow === user.id ? <input value={user.name} /> : user.name}</td>
              <td>{editingRow === user.id ? <input value={user.email} /> : user.email}</td>
              <td>{editingRow === user.id ? <input value={user.role} /> : user.role}</td>
              <td>
                {editingRow === user.id ? (
                  <button className="save" onClick={handleSave}>Save</button>
                ) : (
                  <>
                    <button className="edit" onClick={() => handleEdit(user.id)}>Edit</button>
                    <button className="delete" onClick={() => handleDelete(user.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination */}
      <div className="pagination">
        <span>{`Page ${currentPage} of ${totalPages}`}</span>
        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>First Page</button>
        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
          Previous Page
        </button>
        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={indexOfLastUser >= filteredUsers.length}>
          Next Page
        </button>
        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>Last Page</button>
      </div>
      {/* Bulk delete button */}
      <button className="delete" onClick={handleBulkDelete} disabled={selectedRows.length === 0}>
        Delete Selected
      </button>
    </div>
  );
};

export default AdminDashboard;
