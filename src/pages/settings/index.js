import React, { useState, useEffect } from 'react';
import { Settings, Globe, CreditCard, Package, Palette, Users, Phone, Mail, MapPin, Zap } from 'lucide-react';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('General');
  
  const [formData, setFormData] = useState({
    siteName: '',
    siteTitle: '',
    phoneNumber: '',
    phoneNumber2: '',
    whatsappNumber: '',
    email: '',
    address: '',
    siteLoading: '',
    invoiceString: '',
    websiteFavicon: '',
    websiteLogo: '',
    youtube: '',
    instagram: '',
    twitter: '',
    facebook: '',
    outsideDhakaCharge: '',
    subDhakaCharge: '',
    insideDhakaCharge: '',
    freeDelivery: '',
    pixelId: '',
    accessToken: '',
    testCode: '',
    pixelIdTag: '',
    fbPixelCode: '',
    tagManagerCode: '',
    blockPhoneNumber: '',
    blockIpAddress: '',
    topInfoActive: 'Active',
    topInfoText: '',
    homePageTemplate: ''
  });

  const menuItems = [
    { name: 'General', icon: Settings },
    { name: 'Logo', icon: Globe },
    { name: 'Social Links', icon: Users },
    { name: 'Delivery Charge', icon: CreditCard },
    { name: 'Facebook Conversation API', icon: Users },
    { name: 'Pixel or Google Tag Settings', icon: Zap },
    { name: 'Block', icon: Settings }
  ];

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success'); // 'success' or 'error'

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Show message with auto-hide
  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  // Load all settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load invoice string
      const invoiceResponse = await fetch('/api/settings/invoice-string');
      if (invoiceResponse.ok) {
        const invoiceData = await invoiceResponse.json();
        setFormData(prev => ({ 
          ...prev, 
          invoiceString: invoiceData.invoiceString || '' 
        }));
      }
      
      // Load other settings if needed
      // You can add more API calls here to load other settings
      
    } catch (error) {
      console.error('Error loading settings:', error);
      showMessage('Error loading settings', 'error');
    }
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showMessage('Please login first', 'error');
        setLoading(false);
        return;
      }

      let response;
      let endpoint;
      let payload;

      // Handle different sections
      switch (activeSection) {
        case 'General':
          endpoint = '/api/settings/invoice-string';
          payload = { invoiceString: formData.invoiceString };
          break;
        
        case 'Logo':
          // Handle file uploads if needed
          endpoint = '/api/settings/bulk';
          payload = {
            websiteFavicon: formData.websiteFavicon,
            websiteLogo: formData.websiteLogo
          };
          break;
        
        case 'Social Links':
          endpoint = '/api/settings/bulk';
          payload = {
            youtube: formData.youtube,
            instagram: formData.instagram,
            twitter: formData.twitter,
            facebook: formData.facebook
          };
          break;
        
        case 'Delivery Charge':
          endpoint = '/api/settings/bulk';
          payload = {
            outsideDhakaCharge: formData.outsideDhakaCharge,
            subDhakaCharge: formData.subDhakaCharge,
            insideDhakaCharge: formData.insideDhakaCharge,
            freeDelivery: formData.freeDelivery
          };
          break;
        
        case 'Facebook Conversation API':
          endpoint = '/api/settings/bulk';
          payload = {
            pixelId: formData.pixelId,
            accessToken: formData.accessToken,
            testCode: formData.testCode
          };
          break;
        
        case 'Pixel or Google Tag Settings':
          endpoint = '/api/settings/bulk';
          payload = {
            pixelIdTag: formData.pixelIdTag,
            fbPixelCode: formData.fbPixelCode,
            tagManagerCode: formData.tagManagerCode
          };
          break;
        
        case 'Block':
          endpoint = '/api/settings/bulk';
          payload = {
            blockPhoneNumber: formData.blockPhoneNumber,
            blockIpAddress: formData.blockIpAddress
          };
          break;
        
        default:
          endpoint = '/api/settings/invoice-string';
          payload = { invoiceString: formData.invoiceString };
      }

      response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(data.message || 'Settings saved successfully!', 'success');
      } else {
        showMessage(data.error || 'Error saving settings', 'error');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('Network error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="w-full lg:w-64 bg-white shadow-sm border-r border-gray-200">
          <div className="p-4 lg:p-6">
            <h1 className="text-lg font-semibold text-gray-800 mb-4">Settings List</h1>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => setActiveSection(item.name)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeSection === item.name
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <IconComponent className="mr-2 h-4 w-4" />
                    <span className="truncate">{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8">
          <div className="w-full">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">{activeSection} Settings</h2>
                <p className="text-sm text-gray-600 mt-1">Manage your {activeSection.toLowerCase()} configuration</p>
              </div>

              <div className="p-6">
                {activeSection === 'General' && (
                  <div className="space-y-6">
                    {/* Site Name */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-6">
                      <label className="text-sm font-medium text-gray-700">Site Name</label>
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          value={formData.siteName}
                          onChange={(e) => handleInputChange('siteName', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter site name"
                        />
                      </div>
                    </div>
                    
                    {/* Site Title */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start mb-6">
                      <label className="text-sm font-medium text-gray-700 pt-2">Site Title</label>
                      <div className="md:col-span-2">
                        <textarea
                          value={formData.siteTitle}
                          onChange={(e) => handleInputChange('siteTitle', e.target.value)}
                          rows="2"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          placeholder="Enter site title"
                        />
                      </div>
                    </div>
                    
                    {/* Phone Number */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-6">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        Phone Number
                      </label>
                      <div className="md:col-span-2">
                        <input
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                    
                    {/* Phone Number 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-6">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        Phone Number 2
                      </label>
                      <div className="md:col-span-2">
                        <input
                          type="tel"
                          value={formData.phoneNumber2}
                          onChange={(e) => handleInputChange('phoneNumber2', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter second phone number"
                        />
                      </div>
                    </div>
                    
                    {/* WhatsApp Number */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-6">
                      <label className="text-sm font-medium text-gray-700">WhatsApp Number</label>
                      <div className="md:col-span-2">
                        <input
                          type="tel"
                          value={formData.whatsappNumber}
                          onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter WhatsApp number"
                        />
                      </div>
                    </div>
                    
                    {/* Email */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-6">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </label>
                      <div className="md:col-span-2">
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>
                    
                    {/* Address */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start mb-6">
                      <label className="text-sm font-medium text-gray-700 pt-2 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        Address
                      </label>
                      <div className="md:col-span-2">
                        <textarea
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          rows="3"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          placeholder="Enter store address"
                        />
                      </div>
                    </div>
                    
                    {/* Invoice String */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-6">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <CreditCard className="h-4 w-4 mr-1" />
                        Invoice String
                      </label>
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          value={formData.invoiceString}
                          onChange={(e) => handleInputChange('invoiceString', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter invoice string"
                        />
                      </div>
                    </div>
                    
                    {/* Top Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-6">
                      <label className="text-sm font-medium text-gray-700">Top Info</label>
                      <div className="md:col-span-2 flex gap-2 items-center">
                        <button
                          type="button"
                          onClick={() => handleInputChange('topInfoActive', formData.topInfoActive === 'Active' ? 'Inactive' : 'Active')}
                          className={`px-4 py-1 rounded-full text-xs font-semibold transition-all duration-300 border-2 focus:outline-none ${
                            formData.topInfoActive === 'Active'
                              ? 'bg-green-100 text-green-800 border-green-400'
                              : 'bg-red-100 text-red-800 border-red-400'
                          }`}
                        >
                          {formData.topInfoActive === 'Active' ? 'Active' : 'Inactive'}
                        </button>
                        <input
                          type="text"
                          value={formData.topInfoText || ''}
                          onChange={e => handleInputChange('topInfoText', e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter top info text"
                        />
                      </div>
                    </div>
                    
                    {/* Site Loading */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-6">
                      <label className="text-sm font-medium text-gray-700">Site Loading</label>
                      <div className="md:col-span-2">
                        <select
                          value={formData.siteLoading}
                          onChange={(e) => handleInputChange('siteLoading', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Home Page Template */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-6">
                      <label className="text-sm font-medium text-gray-700">Home Page Template</label>
                      <div className="md:col-span-2">
                        <select
                          value={formData.homePageTemplate || ''}
                          onChange={e => handleInputChange('homePageTemplate', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select</option>
                          <option value="category">Category Wise</option>
                          <option value="all">All Product</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'Logo' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-medium text-gray-700">Website Favicon</label>
                      <div className="md:col-span-2">
                        <input
                          type="file"
                          onChange={(e) => handleInputChange('websiteFavicon', e.target.files[0])}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          accept="image/*"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-medium text-gray-700">Website Logo</label>
                      <div className="md:col-span-2">
                        <input
                          type="file"
                          onChange={(e) => handleInputChange('websiteLogo', e.target.files[0])}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          accept="image/*"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'Social Links' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-medium text-gray-700">YouTube</label>
                      <div className="md:col-span-2">
                        <input
                          type="url"
                          value={formData.youtube}
                          onChange={(e) => handleInputChange('youtube', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter YouTube URL"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-medium text-gray-700">Instagram</label>
                      <div className="md:col-span-2">
                        <input
                          type="url"
                          value={formData.instagram}
                          onChange={(e) => handleInputChange('instagram', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter Instagram URL"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-medium text-gray-700">Twitter</label>
                      <div className="md:col-span-2">
                        <input
                          type="url"
                          value={formData.twitter}
                          onChange={(e) => handleInputChange('twitter', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter Twitter URL"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-medium text-gray-700">Facebook</label>
                      <div className="md:col-span-2">
                        <input
                          type="url"
                          value={formData.facebook}
                          onChange={(e) => handleInputChange('facebook', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter Facebook URL"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'Delivery Charge' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-medium text-gray-700">Outside Dhaka Delivery Charge</label>
                      <div className="md:col-span-2">
                        <input
                          type="number"
                          value={formData.outsideDhakaCharge}
                          onChange={(e) => handleInputChange('outsideDhakaCharge', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter charge amount"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-medium text-gray-700">Sub Dhaka Delivery Charge</label>
                      <div className="md:col-span-2">
                        <input
                          type="number"
                          value={formData.subDhakaCharge}
                          onChange={(e) => handleInputChange('subDhakaCharge', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter charge amount"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-medium text-gray-700">Inside Dhaka Delivery Charge</label>
                      <div className="md:col-span-2">
                        <input
                          type="number"
                          value={formData.insideDhakaCharge}
                          onChange={(e) => handleInputChange('insideDhakaCharge', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter charge amount"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-medium text-gray-700">Free Delivery</label>
                      <div className="md:col-span-2">
                        <input
                          type="number"
                          value={formData.freeDelivery}
                          onChange={(e) => handleInputChange('freeDelivery', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Minimum amount for free delivery"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'Facebook Conversation API' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-medium text-gray-700">Pixel ID</label>
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          value={formData.pixelId}
                          onChange={(e) => handleInputChange('pixelId', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter Pixel ID"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-medium text-gray-700">Access Token</label>
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          value={formData.accessToken}
                          onChange={(e) => handleInputChange('accessToken', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter Access Token"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                      <label className="text-sm font-medium text-gray-700 pt-2">Test Code</label>
                      <div className="md:col-span-2">
                        <textarea
                          value={formData.testCode}
                          onChange={(e) => handleInputChange('testCode', e.target.value)}
                          rows="4"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono"
                          placeholder="Enter test code"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'Pixel or Google Tag Settings' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-medium text-gray-700">Pixel ID</label>
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          value={formData.pixelIdTag}
                          onChange={(e) => handleInputChange('pixelIdTag', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter Pixel ID"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                      <label className="text-sm font-medium text-gray-700 pt-2">FB Pixel Code</label>
                      <div className="md:col-span-2">
                        <textarea
                          value={formData.fbPixelCode}
                          onChange={(e) => handleInputChange('fbPixelCode', e.target.value)}
                          rows="4"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono"
                          placeholder="Enter FB Pixel Code"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                      <label className="text-sm font-medium text-gray-700 pt-2">Tag Manager Code</label>
                      <div className="md:col-span-2">
                        <textarea
                          value={formData.tagManagerCode}
                          onChange={(e) => handleInputChange('tagManagerCode', e.target.value)}
                          rows="4"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono"
                          placeholder="Enter Google Tag Manager Code"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'Block' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-medium text-gray-700">Phone Number</label>
                      <div className="md:col-span-2">
                        <input
                          type="tel"
                          value={formData.blockPhoneNumber}
                          onChange={(e) => handleInputChange('blockPhoneNumber', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter phone number to block"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-medium text-gray-700">IP Address</label>
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          value={formData.blockIpAddress}
                          onChange={(e) => handleInputChange('blockIpAddress', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter IP address to block"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button - Common for all sections */}
                <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
                  <div className="flex flex-col items-end space-y-2">
                    {message && (
                      <div className={`text-sm px-3 py-1 rounded ${
                        messageType === 'error' 
                          ? 'text-red-600 bg-red-50 border border-red-200' 
                          : 'text-green-600 bg-green-50 border border-green-200'
                      }`}>
                        {message}
                      </div>
                    )}
                    <button 
                      onClick={handleSaveChanges}
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {loading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      )}
                      <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}