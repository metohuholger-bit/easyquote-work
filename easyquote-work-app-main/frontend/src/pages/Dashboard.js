import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, FileText, ClipboardList, History, TrendingUp } from "lucide-react";
import axios from "../lib/axiosClient";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [stats, setStats] = useState({
    customers: 0,
    jobTypes: 0,
    quotes: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [customersRes, jobTypesRes, quotesRes] = await Promise.all([
        axios.get(`${API}/customers`),
        axios.get(`${API}/job-types`),
        axios.get(`${API}/quotes`)
      ]);

      setStats({
        customers: customersRes.data.length,
        jobTypes: jobTypesRes.data.length,
        quotes: quotesRes.data.length
      });
    } catch (error) {
      console.error("Errore nel caricamento delle statistiche:", error);
    }
  };

  const cards = [
    {
      title: "Clienti",
      count: stats.customers,
      icon: <Users size={32} strokeWidth={1.5} />,
      link: "/clienti",
      color: "#1B3A24",
      testId: "dashboard-customers-card"
    },
    {
      title: "Listino Prezzi",
      count: stats.jobTypes,
      icon: <FileText size={32} strokeWidth={1.5} />,
      link: "/listino",
      color: "#D56F53",
      testId: "dashboard-jobtypes-card"
    },
    {
      title: "Preventivi",
      count: stats.quotes,
      icon: <ClipboardList size={32} strokeWidth={1.5} />,
      link: "/storico",
      color: "#1B3A24",
      testId: "dashboard-quotes-card"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8" data-testid="dashboard-header">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2">
          Benvenuto
        </h2>
        <p className="text-base text-slate-600">
          Gestisci i tuoi clienti, listino prezzi e preventivi
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {cards.map((card, index) => (
          <Link
            key={index}
            to={card.link}
            className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            data-testid={card.testId}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 uppercase tracking-wider mb-2">
                  {card.title}
                </p>
                <p className="text-4xl font-bold" style={{ color: card.color }}>
                  {card.count}
                </p>
              </div>
              <div style={{ color: card.color }} className="opacity-80">
                {card.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Azioni Rapide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/nuovo-preventivo"
            className="bg-[#1B3A24] text-white rounded-lg p-5 flex items-center justify-between hover:bg-[#2C5530] transition-all duration-200 shadow-sm active:scale-[0.98]"
            data-testid="quick-action-new-quote"
          >
            <div>
              <h4 className="text-lg font-semibold mb-1">Nuovo Preventivo</h4>
              <p className="text-sm text-slate-200">Crea un preventivo per un cliente</p>
            </div>
            <ClipboardList size={28} strokeWidth={1.5} />
          </Link>

          <Link
            to="/clienti"
            className="bg-white border-2 border-[#1B3A24] text-[#1B3A24] rounded-lg p-5 flex items-center justify-between hover:bg-[#F1F5F9] transition-all duration-200 shadow-sm active:scale-[0.98]"
            data-testid="quick-action-manage-customers"
          >
            <div>
              <h4 className="text-lg font-semibold mb-1">Gestisci Clienti</h4>
              <p className="text-sm text-slate-600">Aggiungi o modifica clienti</p>
            </div>
            <Users size={28} strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
