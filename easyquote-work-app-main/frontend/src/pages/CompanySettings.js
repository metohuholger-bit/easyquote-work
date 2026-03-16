import React, { useState, useEffect } from "react";
import { Building2, Save, Upload, X } from "lucide-react";
import axios from "../lib/axiosClient";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CompanySettings = () => {
  const [formData, setFormData] = useState({
    company_name: "",
    owner_name: "",
    vat_number: "",
    tax_code: "",
    address: "",
    phone: "",
    email: "",
    logo_base64: ""
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await axios.get(`${API}/company-settings`);
      setFormData(response.data);
      if (response.data.logo_base64) {
        setLogoPreview(`data:image/png;base64,${response.data.logo_base64}`);
      }
    } catch (error) {
      console.error("Errore nel caricamento delle impostazioni:", error);
      toast.error("Impossibile caricare le impostazioni");
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Il logo deve essere inferiore a 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      setFormData({ ...formData, logo_base64: base64 });
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setFormData({ ...formData, logo_base64: "" });
    setLogoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`${API}/company-settings`, formData);
      toast.success("Impostazioni salvate con successo");
      loadSettings();
    } catch (error) {
      console.error("Errore nel salvataggio delle impostazioni:", error);
      toast.error("Errore nel salvataggio delle impostazioni");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center gap-3">
        <Building2 size={32} className="text-[#1B3A24]" />
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900" data-testid="company-settings-title">
          Impostazioni Azienda
        </h2>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <p className="text-sm text-slate-600">
          Questi dati verranno utilizzati automaticamente in tutti i PDF generati (preventivi, fatture, ecc.)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo Upload */}
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
          <Label className="block text-sm font-medium text-slate-700 mb-3">
            Logo Aziendale
          </Label>
          <div className="flex items-start gap-4">
            {logoPreview ? (
              <div className="relative">
                <img
                  src={logoPreview}
                  alt="Logo"
                  className="w-32 h-32 object-contain border border-slate-200 rounded-lg"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveLogo}
                  className="absolute -top-2 -right-2 bg-red-500 text-white hover:bg-red-600 rounded-full w-6 h-6"
                >
                  <X size={14} />
                </Button>
              </div>
            ) : (
              <div className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center">
                <Upload size={32} className="text-slate-400" />
              </div>
            )}
            <div className="flex-1">
              <Input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="h-14"
                data-testid="logo-upload-input"
              />
              <p className="text-xs text-slate-500 mt-2">
                Formato: PNG, JPG, JPEG. Dimensione massima: 2MB
              </p>
            </div>
          </div>
        </div>

        {/* Company Details */}
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm space-y-5">
          <h3 className="text-lg font-semibold text-slate-900">Dati Aziendali</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="company_name" className="block text-sm font-medium text-slate-700 mb-1.5">
                Nome Azienda *
              </Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                required
                className="h-14"
                data-testid="company-name-input"
              />
            </div>

            <div>
              <Label htmlFor="owner_name" className="block text-sm font-medium text-slate-700 mb-1.5">
                Nome Titolare *
              </Label>
              <Input
                id="owner_name"
                value={formData.owner_name}
                onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                required
                className="h-14"
                data-testid="owner-name-input"
              />
            </div>

            <div>
              <Label htmlFor="vat_number" className="block text-sm font-medium text-slate-700 mb-1.5">
                Partita IVA *
              </Label>
              <Input
                id="vat_number"
                value={formData.vat_number}
                onChange={(e) => setFormData({ ...formData, vat_number: e.target.value })}
                required
                placeholder="IT00000000000"
                className="h-14"
                data-testid="vat-number-input"
              />
            </div>

            <div>
              <Label htmlFor="tax_code" className="block text-sm font-medium text-slate-700 mb-1.5">
                Codice Fiscale *
              </Label>
              <Input
                id="tax_code"
                value={formData.tax_code}
                onChange={(e) => setFormData({ ...formData, tax_code: e.target.value })}
                required
                placeholder="XXXXXXXXXXX"
                className="h-14"
                data-testid="tax-code-input"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1.5">
                Indirizzo Completo *
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                placeholder="Via, CAP, Città, Provincia"
                className="h-14"
                data-testid="address-input"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">
                Telefono *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                placeholder="+39 000 0000000"
                className="h-14"
                data-testid="phone-input"
              />
            </div>

            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="info@azienda.it"
                className="h-14"
                data-testid="email-input"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1B3A24] hover:bg-[#2C5530] h-14 rounded-lg font-medium shadow-md active:scale-[0.98] transition-all text-lg"
          data-testid="save-settings-button"
        >
          <Save size={24} className="mr-2" />
          {loading ? "Salvataggio..." : "Salva Impostazioni"}
        </Button>
      </form>
    </div>
  );
};

export default CompanySettings;
