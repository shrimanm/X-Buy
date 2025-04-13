import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Image } from 'react-bootstrap';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import FormContainer from '../../components/FormContainer';
import { toast } from 'react-toastify';
import {
  useCreateProductMutation,
  useGetUploadSignatureMutation // Changed this import
} from '../../slices/productsApiSlice';

const ProductEditScreen = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [getSignature] = useGetUploadSignatureMutation(); // New mutation
  const [createProduct, { isLoading: loadingCreate }] = useCreateProductMutation();

  const navigate = useNavigate();

  useEffect(() => {
    return () => setError(null);
  }, []);

  const resetForm = () => {
    setName('');
    setPrice(0);
    setImage('');
    setBrand('');
    setCategory('');
    setCountInStock(0);
    setDescription('');
    setImagePreview(null);
    setError(null);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    
    if (!name || !price || !brand || !category || !countInStock || !description) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!image) {
      toast.error('Please upload an image');
      return;
    }

    try {
      await createProduct({
        name,
        price: Number(price),
        image,
        brand,
        category,
        countInStock: Number(countInStock),
        description
      }).unwrap();
      
      toast.success('Product Created Successfully');
      resetForm();
      navigate('/admin/productlist');
    } catch (err) {
      console.error('Create product error:', err);
      toast.error(err?.data?.message || err.error);
      setError(err?.data?.message || err.error);
    }
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('File size should be less than 5MB');
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    try {
      setIsUploading(true);
      setError(null);

      // Get signature for upload
      const signatureResponse = await getSignature().unwrap();
      console.log('Signature response:', signatureResponse); // Debug log

      if (!signatureResponse || !signatureResponse.signature) {
        throw new Error('Invalid signature response');
      }

      // Create form data for Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signatureResponse.apikey);
      formData.append('timestamp', signatureResponse.timestamp.toString());
      formData.append('signature', signatureResponse.signature);
      formData.append('folder', 'products');

      // Log FormData contents (for debugging)
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      // Upload directly to Cloudinary
      const uploadUrl = `https://api.cloudinary.com/v1_1/${signatureResponse.cloudname}/image/upload`;
      console.log('Upload URL:', uploadUrl); // Debug log

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Cloudinary error response:', errorData); // Debug log
        throw new Error(`Upload failed: ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('Cloudinary success response:', result); // Debug log

      if (result.secure_url) {
        setImage(result.secure_url);
        toast.success('Image uploaded successfully');
      } else {
        throw new Error('No secure URL received from Cloudinary');
      }
    } catch (err) {
      console.error('Upload error details:', err); // Debug log
      toast.error(err.message || 'Upload failed');
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
};

  return (
    <>
      <Link to='/admin/productlist' className='btn btn-light my-3'>
        Go Back
      </Link>
      <FormContainer>
        <h1>Create Product</h1>
        {error && <Message variant='danger'>{error}</Message>}
        {loadingCreate && <Loader />}
        
        <Form onSubmit={submitHandler}>
        <Form.Group controlId='name' className='my-2'>
        <Form.Label>Name</Form.Label>
        <Form.Control
          type='text'
          placeholder='Enter name'
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group controlId='price' className='my-2'>
        <Form.Label>Price</Form.Label>
        <Form.Control
          type='number'
          placeholder='Enter price'
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </Form.Group>

          <Form.Group controlId='image' className='my-2'>
            <Form.Label>Image</Form.Label>
            {(imagePreview || image) && (
              <div className='my-2'>
                <Image
                  src={image || imagePreview}
                  alt="Product"
                  fluid
                  rounded
                  style={{ maxWidth: '200px' }}
                />
              </div>
            )}
            {image && (
              <Form.Control
                type='text'
                placeholder='Image URL'
                value={image}
                readOnly
                className='my-2'
              />
            )}
            <Form.Control
              type='file'
              onChange={uploadFileHandler}
              accept=".jpg,.jpeg,.png,.webp"
              disabled={isUploading}
            />
            {isUploading && <Loader />}
          </Form.Group>

          <Form.Group controlId='brand' className='my-2'>
            <Form.Label>Brand</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter brand'
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId='countInStock' className='my-2'>
            <Form.Label>Count In Stock</Form.Label>
            <Form.Control
              type='number'
              placeholder='Enter count in stock'
              value={countInStock}
              onChange={(e) => setCountInStock(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId='category' className='my-2'>
            <Form.Label>Category</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter category'
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId='description' className='my-2'>
            <Form.Label>Description</Form.Label>
            <Form.Control
              as='textarea'
              rows={3}
              placeholder='Enter description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Form.Group>

          <Button
            type='submit'
            variant='primary'
            className='my-3'
            disabled={loadingCreate || isUploading}
          >
            Create Product
          </Button>
        </Form>
      </FormContainer>
    </>
  );
};

export default ProductEditScreen;