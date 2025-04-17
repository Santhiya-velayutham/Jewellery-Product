import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Table, Card, Image } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import Swal from 'sweetalert2';
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';

const initialFormState = {
  name: '',
  price: '',
  stock: '',
  category: '',
  description: '',
  mfgDate: new Date(),
  image: null,
};

const categories = ['Ring', 'Necklace', 'Earring', 'Bracelet'];

const ProductForm = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [preview, setPreview] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/getProducts');
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, mfgDate: date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "mfgDate") {
        data.append(key, value.toISOString().split("T")[0]);
      } else if (key === "image" && value) {
        data.append(key, value);
      } else {
        data.append(key, value);
      }
    });

    try {
      if (editingId) {
        await axios.put(`http://localhost:8080/api/updateProduct/${editingId}`, data);
        Swal.fire({ icon: 'success', title: 'Product Updated' });
      } else {
        await axios.post('http://localhost:8080/api/createProduct', data);
        Swal.fire({ icon: 'success', title: 'Product Created' });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Operation Failed' });
    } finally {
      setFormData(initialFormState);
      setPreview(null);
      setEditingId(null);
      fetchProducts();
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description,
      category: product.category,
      mfgDate: new Date(product.mfgDate),
      image: null,
    });
    setPreview(product.imageUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This product will be permanently deleted.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:8080/api/deleteProduct/${id}`);
        fetchProducts();
        Swal.fire('Deleted!', 'The product has been removed.', 'success');
      } catch (err) {
        console.error(err);
        Swal.fire('Error!', 'Delete failed.', 'error');
      }
    }
  };

  const sortProducts = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    let sorted = [...products];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (typeof aVal === 'string') {
          return sortConfig.direction === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        } else {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
      });
    }
    return sorted;
  };

  const getFilteredData = () => {
    return getSortedData().filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const paginatedData = () => {
    const filtered = getFilteredData();
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  };

  const totalPages = Math.ceil(getFilteredData().length / itemsPerPage);

  const handleLogout = () => {
    localStorage.removeItem('token'); // or any auth key
    Swal.fire('Logged out!', 'You have been successfully logged out.', 'success').then(() => {
      window.location.href = '/';
    });
  };

  return (
    <Container fluid className="py-4 px-4">
      {/* Logout Button */}
      <div className="d-flex justify-content-end mb-3">
        <Button variant="danger" onClick={handleLogout}>🔓 Logout</Button>
      </div>

      {/* FORM SECTION */}
      <Card className="p-4 shadow-sm mb-4 border-0 mx-auto" style={{ maxWidth: '900px' }}>
        <h4 className="mb-3 text-primary text-center">
          💎 {editingId ? 'Update' : 'Add'} Jewellery Product
        </h4>
        <Form onSubmit={handleSubmit} encType="multipart/form-data">
          <Row className="g-3">
            <Col md={6}><Form.Group><Form.Label>Name</Form.Label>
              <Form.Control name="name" value={formData.name} onChange={handleInputChange} required /></Form.Group></Col>
            <Col md={3}><Form.Group><Form.Label>Price</Form.Label>
              <Form.Control type="number" name="price" value={formData.price} onChange={handleInputChange} required /></Form.Group></Col>
            <Col md={3}><Form.Group><Form.Label>Stock</Form.Label>
              <Form.Control type="number" name="stock" value={formData.stock} onChange={handleInputChange} required /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Category</Form.Label>
              <Form.Select name="category" value={formData.category} onChange={handleInputChange} required>
                <option value="">Select Category</option>
                {categories.map((cat, i) => <option key={i}>{cat}</option>)}
              </Form.Select></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>MFG Date</Form.Label><br />
              <DatePicker selected={formData.mfgDate} onChange={handleDateChange} className="form-control" /></Form.Group></Col>
            <Col md={12}><Form.Group><Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={2} name="description" value={formData.description} onChange={handleInputChange} /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Image</Form.Label>
              <Form.Control type="file" name="image" onChange={handleImageChange} accept="image/*" /></Form.Group>
              {preview && (<Image src={preview} thumbnail width={100} className="mt-2" />)}</Col>
            <Col md={6} className="d-flex align-items-end">
              <Button type="submit" variant="primary" className="w-100 fw-semibold py-2">
                {editingId ? '✏️ Update Product' : '💾 Save Product'}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* TABLE SECTION */}
      <Card className="p-4 shadow-sm border-0 mx-auto mt-4" style={{ maxWidth: '1200px' }}>
        <div className="d-flex justify-content-between mb-3">
          <h5 className="text-success fw-bold">📦 Product List</h5>
          <Form.Control
            type="text"
            placeholder="🔍 Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '250px' }}
          />
        </div>

        <Table responsive bordered hover className="text-nowrap fs-6 table-striped table-sm">
          <thead className="table-light">
            <tr>
              <th>Id</th>
              {['name', 'price', 'stock', 'category', 'mfgDate', 'description'].map(key => (
                <th key={key} onClick={() => sortProducts(key)} style={{ cursor: 'pointer' }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)} {sortConfig.key === key ? (sortConfig.direction === 'asc' ? '⬆️' : '⬇️') : ''}
                </th>
              ))}
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData().map((p, i) => (
              <tr key={p._id}>
                <td>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                <td>{p.name}</td>
                <td>₹{p.price}</td>
                <td>{p.stock}</td>
                <td>{p.category}</td>
                <td>{new Date(p.mfgDate).toLocaleDateString()}</td>
                <td>{p.description}</td>
                <td><Image src={p.imageUrl} width={60} rounded /></td>
                <td>
                  <Button variant="outline-warning" size="sm" onClick={() => handleEdit(p)} className="me-1">🖊️</Button>
                  <Button variant="outline-danger" size="sm" onClick={() => handleDelete(p._id)}>🗑️</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* PAGINATION */}
        <div className="d-flex justify-content-center mt-3">
          <Button
            variant="outline-secondary"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="me-2"
          >⬅️ Prev</Button>
          <span className="align-self-center">Page {currentPage} of {totalPages}</span>
          <Button
            variant="outline-secondary"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="ms-2"
          >Next ➡️</Button>
        </div>
      </Card>
    </Container>
  );
};

export default ProductForm;
