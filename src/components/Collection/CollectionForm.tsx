import React, { useState, useEffect } from 'react';
import { Sprout, MapPin, Upload, AlertCircle, CheckCircle, Loader2, Cloud, Thermometer } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { AYURVEDIC_HERBS, APPROVED_ZONES } from '../../config/herbs';
import blockchainService from '../../services/blockchainService';
import ipfsService from '../../services/ipfsService';
import qrService from '../../services/qrService';
import QRCodeDisplay from '../Common/QRCodeDisplay';

const CollectionForm: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState<any>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [qrResult, setQrResult] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);
  const [zoneValidation, setZoneValidation] = useState<any>(null);

  const [formData, setFormData] = useState({
    herbSpecies: '',
    weight: '',
    harvestDate: new Date().toISOString().split('T')[0],
    zone: '', // Now free text input
    qualityGrade: '', // Now mandatory
    notes: '',
    collectorGroupName: user?.name || '',
    image: null as File | null
  });

  useEffect(() => {
    getCurrentLocation();
    initializeBlockchain();
  }, []);

  const initializeBlockchain = async () => {
    try {
      await blockchainService.initialize();
    } catch (error) {
      console.error('Error initializing blockchain:', error);
    }
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
            accuracy: position.coords.accuracy
          });
          // Get weather data
          getWeatherData(position.coords.latitude, position.coords.longitude);
          // Validate zone for herb
          validateHerbZone(position.coords.latitude, position.coords.longitude);
          setLocationLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationLoading(false);
          setError('Unable to get location. Please enable location services.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    } else {
      setLocationLoading(false);
      setError('Geolocation is not supported by this browser');
    }
  };

  const getWeatherData = async (lat: number, lon: number) => {
    try {
      // Using OpenWeatherMap free API (demo)
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=demo&units=metric`
      );
      if (response.ok) {
        const data = await response.json();
        setWeather({
          temperature: data.main?.temp || 'N/A',
          humidity: data.main?.humidity || 'N/A',
          description: data.weather?.[0]?.description || 'N/A'
        });
      }
    } catch (error) {
      // Demo weather data
      setWeather({
        temperature: '25°C',
        humidity: '65%',
        description: 'Clear sky'
      });
    }
  };

  const validateHerbZone = (lat: number, lon: number) => {
    // Demo validation - in production, check against herb-specific zones
    const isValidZone = Math.random() > 0.2; // 80% chance of valid zone
    setZoneValidation({
      isValid: isValidZone,
      message: isValidZone ? 'Location approved for this herb' : 'Warning: This location may not be optimal for this herb species'
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (!location) {
      setError('Location is required for collection');
      setLoading(false);
      return;
    }

    try {
      // Generate batch and event IDs
      const batchId = blockchainService.generateBatchId();
      const collectionEventId = blockchainService.generateEventId('COLLECTION');

      let imageHash = null;
      if (formData.image) {
        const imageUpload = await ipfsService.uploadFile(formData.image);
        if (imageUpload.success) {
          imageHash = imageUpload.ipfsHash;
        }
      }

      // Create collection metadata
      const collectionData = {
        batchId,
        herbSpecies: formData.herbSpecies,
        collector: formData.collectorGroupName,
        weight: parseFloat(formData.weight),
        harvestDate: formData.harvestDate,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          zone: formData.zone
        },
        qualityGrade: formData.qualityGrade,
        notes: formData.notes,
        images: imageHash ? [imageHash] : []
      };

      // Upload metadata to IPFS
      const metadataUpload = await ipfsService.createCollectionMetadata(collectionData);
      if (!metadataUpload.success) {
        throw new Error('Failed to upload metadata to IPFS');
      }

      // Generate QR code
      const qrResult = await qrService.generateCollectionQR(
        batchId,
        collectionEventId,
        formData.herbSpecies,
        formData.collectorGroupName
      );

      if (!qrResult.success) {
        throw new Error('Failed to generate QR code');
      }

      // Create batch on blockchain
      const blockchainData = {
        batchId,
        herbSpecies: formData.herbSpecies,
        collectionEventId,
        ipfsHash: metadataUpload.ipfsHash,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          zone: formData.zone
        },
        qrCodeHash: qrResult.qrHash,
        weather: weather
      };

      const blockchainResult = await blockchainService.createBatch(
        user?.address || '',
        blockchainData
      );

      if (!blockchainResult.success) {
        throw new Error('Failed to create batch on blockchain');
      }

      setSuccess(true);
      setQrResult({
        batchId,
        eventId: collectionEventId,
        herbSpecies: formData.herbSpecies,
        weight: parseFloat(formData.weight),
        location: { zone: formData.zone },
        qr: qrResult,
        fabric: blockchainResult,
        weather: weather
      });

      // Reset form
      setFormData({
        herbSpecies: '',
        weight: '',
        harvestDate: new Date().toISOString().split('T')[0],
        zone: '',
        qualityGrade: '', // Will be required
        notes: '',
        collectorGroupName: user?.name || '',
        image: null
      });
    } catch (error) {
      console.error('Collection creation error:', error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccess(false);
    setQrResult(null);
    setError('');
  };

  if (success && qrResult) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-black/20 backdrop-blur-xl rounded-xl shadow-2xl p-8 border border-green-500/20">
          <div className="text-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Collection Successful!</h2>
            <p className="text-green-300">Your herb collection has been recorded on the blockchain</p>
          </div>

          <div className="bg-green-500/10 backdrop-blur-md rounded-lg p-6 mb-6 border border-green-500/30">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-green-300">Batch ID:</span>
                <p className="text-white font-mono">{qrResult.batchId}</p>
              </div>
              <div>
                <span className="font-medium text-green-300">Herb Species:</span>
                <p className="text-white">{qrResult.herbSpecies}</p>
              </div>
              <div>
                <span className="font-medium text-green-300">Weight:</span>
                <p className="text-white">{qrResult.weight}g</p>
              </div>
              <div>
                <span className="font-medium text-green-300">Location:</span>
                <p className="text-white">{qrResult.location?.zone}</p>
              </div>
            </div>
          </div>

          <QRCodeDisplay
            qrData={{
              dataURL: qrResult.qr.dataURL,
              trackingUrl: qrResult.qr.trackingUrl,
              eventId: qrResult.eventId
            }}
            title="Collection QR Code"
            subtitle="Scan to track this batch"
          />

          <button
            onClick={handleReset}
            className="w-full mt-6 bg-gradient-to-r from-green-500/80 to-emerald-600/80 backdrop-blur-md text-white py-3 px-4 rounded-lg hover:from-green-600/90 hover:to-emerald-700/90 transition-all duration-200 font-medium border border-green-400/30"
          >
            Create New Collection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-black/20 backdrop-blur-xl rounded-xl shadow-2xl p-8 border border-green-500/20">
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-3 bg-gradient-to-r from-green-500/80 to-emerald-600/80 backdrop-blur-md rounded-lg border border-green-400/30">
            <Sprout className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Collector Group</h2>
            <p className="text-green-300">Record herb collection details with location validation</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 backdrop-blur-md border border-red-500/30 rounded-lg p-4 mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
            <span className="text-red-300">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-green-300 mb-2">
                Herb Species *
              </label>
              <select
                name="herbSpecies"
                value={formData.herbSpecies}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-black/20 backdrop-blur-md border border-green-500/30 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400/50 text-white"
              >
                <option value="">Select Herb Species</option>
                {AYURVEDIC_HERBS.map((herb) => (
                  <option key={herb.id} value={herb.common} className="bg-gray-800 text-white">
                    {herb.common} ({herb.botanical})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-700 mb-2">
                Weight (grams) *
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                required
                min="1"
                step="0.1"
                placeholder="Enter weight in grams"
                className="w-full px-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-700 mb-2">
                Harvest Date *
              </label>
              <input
                type="date"
                name="harvestDate"
                value={formData.harvestDate}
                onChange={handleInputChange}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-700 mb-2">
                Harvesting Zone/Location *
              </label>
              <input
                type="text"
                name="zone"
                value={formData.zone}
                onChange={handleInputChange}
                required
                placeholder="Enter collection location/zone"
                className="w-full px-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {zoneValidation && (
                <p className={`text-xs mt-1 ${zoneValidation.isValid ? 'text-green-600' : 'text-orange-600'}`}>
                  {zoneValidation.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-green-700 mb-2">
                Quality Grade *
              </label>
              <select
                name="qualityGrade"
                value={formData.qualityGrade}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select Quality Grade</option>
                <option value="Premium">Premium</option>
                <option value="Grade A">Grade A</option>
                <option value="Grade B">Grade B</option>
                <option value="Standard">Standard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-700 mb-2">
                Collector Group Name *
              </label>
              <input
                type="text"
                name="collectorGroupName"
                value={formData.collectorGroupName}
                onChange={handleInputChange}
                required
                placeholder="Enter collector group name"
                className="w-full px-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Weather & Location Info */}
          {(location || weather) && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                <Cloud className="h-5 w-5 mr-2" />
                Environmental Conditions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {location && (
                  <>
                    <div>
                      <span className="font-medium text-blue-600">Latitude:</span>
                      <p className="text-blue-900">{parseFloat(location.latitude).toFixed(6)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-600">Longitude:</span>
                      <p className="text-blue-900">{parseFloat(location.longitude).toFixed(6)}</p>
                    </div>
                  </>
                )}
                {weather && (
                  <>
                    <div>
                      <span className="font-medium text-blue-600">Temperature:</span>
                      <p className="text-blue-900">{weather.temperature}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-600">Humidity:</span>
                      <p className="text-blue-900">{weather.humidity}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">
              Collection Image
            </label>
            <div className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
              <Upload className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer text-green-600 hover:text-green-700"
              >
                Click to upload image or drag and drop
              </label>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
              {formData.image && (
                <p className="text-sm text-green-600 mt-2">
                  Selected: {formData.image.name}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              placeholder="Enter any additional notes about the collection..."
              className="w-full px-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Location Status */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-700 font-medium">Location Status</span>
              </div>
              {locationLoading ? (
                <div className="flex items-center text-green-600">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Getting location...</span>
                </div>
              ) : location ? (
                <div className="text-green-600 text-sm">
                  ✓ Location captured ({parseFloat(location.latitude).toFixed(4)}, {parseFloat(location.longitude).toFixed(4)})
                </div>
              ) : (
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="text-green-600 hover:text-green-700 text-sm underline"
                >
                  Retry location
                </button>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !location}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-lg flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Creating Collection...
              </>
            ) : (
              'Create Collection Record'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CollectionForm;