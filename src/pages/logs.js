// pages/logs.js

import { useEffect, useState } from 'react';
import Link from 'next/link';
import 'bootstrap/dist/css/bootstrap.css'; 

import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Pagination from 'react-bootstrap/Pagination';

const Logs = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOptions, setFilterOptions] = useState([]);
  const [activePage, setActivePage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/activitylogs');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const responseData = await response.json();
      setData(responseData);
      setFilteredData(responseData);
      setFilterOptions(getFilterOptions(responseData));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getFilterOptions = (data) => {
    if (data.length === 0) return [];
    const firstItem = data[0];
    return Object.keys(firstItem).map((key) => ({ label: key, value: key }));
  };

  const handleFilterChange = (filterKey, selectedValue) => {
    const filtered = data.filter((item) => item[filterKey] === selectedValue);
    setFilteredData(filtered);
    setActivePage(1); // Reset pagination to the first page
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    const filtered = data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(e.target.value.toLowerCase())
      )
    );
    setFilteredData(filtered);
    setActivePage(1); // Reset pagination to the first page
  };

  const handlePaginationSelect = (pageNumber) => {
    setActivePage(pageNumber);
  };

  const indexOfLastItem = activePage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className='container'>
      <h1>Logs</h1>
      <Link href="/">
        <p>Go back to Home</p>
      </Link>
      <div>
        <h2>Data from Database Table:</h2>
        <Form.Control
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <hr />
        <Table striped bordered hover>
          <thead>
            <tr>
                
              {filterOptions.map((option) => (
                <th key={option.value}>
                    {option.value.replace(/_/g, ' ').toUpperCase() }
                  <Form.Control
                    as="select"
                    onChange={(e) => handleFilterChange(option.value, e.target.value)}
                  >
                    <option value="">All</option>
                    {[...new Set(data.map((item) => item[option.value]))].map(
                      (value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      )
                    )}
                  </Form.Control>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={index}>
                {Object.values(item).map((value, idx) => (
                  <td key={idx}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
        <Pagination>
          {[...Array(Math.ceil(filteredData.length / itemsPerPage)).keys()].map((number) => (
            <Pagination.Item
              key={number + 1}
              active={number + 1 === activePage}
              onClick={() => handlePaginationSelect(number + 1)}
            >
              {number + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      </div>
    </div>
  );
};

export default Logs;
