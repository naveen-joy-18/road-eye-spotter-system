
import React, { useState } from 'react';
import { PotholeFormData, Severity, Pothole } from '@/types';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Camera, MapPin, Upload, X } from 'lucide-react';
import { potholes } from '@/data/potholes';

const ReportForm: React.FC = () => {
  const [formData, setFormData] = useState<PotholeFormData>({
    latitude: 0,
    longitude: 0,
    address: '',
    severity: 'medium',
    description: '',
    image: null
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setFormData({ ...formData, image: null });
    setPreviewUrl(null);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData({
            ...formData,
            latitude,
            longitude,
            address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
          });
          toast.success('Location captured successfully!');
        },
        (error) => {
          toast.error('Error getting location');
          console.error('Error getting location:', error);
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Create a new pothole object
    const newPothole: Pothole = {
      id: `report-${Date.now()}`,
      latitude: formData.latitude || 0,
      longitude: formData.longitude || 0,
      address: formData.address || 'Unknown address',
      severity: formData.severity,
      status: 'reported',
      reportedAt: new Date().toISOString(),
      updatedAt: null,
      description: formData.description || 'No description provided',
      imageUrl: previewUrl || '/placeholder.svg',
      reporter: 'User Report',
      upvotes: 0
    };
    
    // Add the new pothole to the potholes array
    potholes.unshift(newPothole);
    
    // Generate CSV file with all pothole reports
    const csvContent = generateCSV(potholes);
    downloadFile(csvContent, 'pothole_reports.csv', 'text/csv');
    
    // Also save as JSON
    const jsonContent = JSON.stringify(potholes, null, 2);
    downloadFile(jsonContent, 'pothole_reports.json', 'application/json');
    
    console.log('Pothole reported and saved to files');
    
    toast.success('Pothole reported successfully!', {
      description: 'Report saved to pothole_reports.csv and pothole_reports.json'
    });
    
    // Reset form
    setFormData({
      latitude: 0,
      longitude: 0,
      address: '',
      severity: 'medium',
      description: '',
      image: null
    });
    setPreviewUrl(null);
    setIsSubmitting(false);
  };

  // Generate CSV from potholes data
  const generateCSV = (data: Pothole[]): string => {
    const headers = ['ID', 'Latitude', 'Longitude', 'Address', 'Severity', 'Status', 'Reported At', 'Description', 'Reporter', 'Upvotes'];
    const rows = data.map(p => [
      p.id,
      p.latitude.toString(),
      p.longitude.toString(),
      `"${p.address}"`,
      p.severity,
      p.status,
      p.reportedAt,
      `"${p.description}"`,
      p.reporter,
      p.upvotes.toString()
    ]);
    
    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  };

  // Download file helper
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report a Pothole</CardTitle>
        <CardDescription>
          Help improve your community by reporting potholes in your area.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="address">Location</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={getCurrentLocation}
                className="text-xs h-7 px-2 flex gap-1"
              >
                <MapPin className="h-3 w-3" /> Current Location
              </Button>
            </div>
            <Input 
              id="address" 
              name="address"
              value={formData.address} 
              onChange={handleInputChange}
              placeholder="Street address or coordinates"
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Severity</Label>
            <Select 
              name="severity" 
              value={formData.severity} 
              onValueChange={(value) => handleSelectChange(value, 'severity')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Minor damage</SelectItem>
                <SelectItem value="medium">Medium - Moderate damage</SelectItem>
                <SelectItem value="high">High - Severe damage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              name="description"
              value={formData.description} 
              onChange={handleInputChange}
              placeholder="Provide details about the pothole"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Photo (Optional)</Label>
            {!previewUrl ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <Label
                    htmlFor="image"
                    className="cursor-pointer flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-md border-gray-300 hover:border-primary transition-colors"
                  >
                    <Upload className="h-5 w-5 text-gray-500 mb-1" />
                    <span className="text-xs text-gray-500">Upload Image</span>
                  </Label>
                </div>
                <div className="relative">
                  <Input
                    id="capture"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <Label
                    htmlFor="capture"
                    className="cursor-pointer flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-md border-gray-300 hover:border-primary transition-colors"
                  >
                    <Camera className="h-5 w-5 text-gray-500 mb-1" />
                    <span className="text-xs text-gray-500">Take Photo</span>
                  </Label>
                </div>
              </div>
            ) : (
              <div className="relative h-40">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-full w-full object-cover rounded-md"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={clearImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || !formData.address}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                Submitting...
              </>
            ) : (
              'Report Pothole'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ReportForm;
