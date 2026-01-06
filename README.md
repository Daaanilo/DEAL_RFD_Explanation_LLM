<p align="center">
  <img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/LLM-AI%20Powered-FF6F00?style=for-the-badge&logo=openai&logoColor=white" alt="LLM">
  <img src="https://img.shields.io/badge/Data-Analytics-4285F4?style=for-the-badge&logo=googleanalytics&logoColor=white" alt="Analytics">
  <img src="https://img.shields.io/badge/Status-Bachelor%20Thesis-blueviolet?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/License-Academic-green?style=for-the-badge" alt="License">
</p>

<h1 align="center">🔍 DEAL</h1>
<h3 align="center">Dependencies Explanation with Advanced Language Models</h3>

<p align="center">
  <strong>Interactive Web Platform for Dependency Analysis powered by LLMs</strong><br>
  <em>Piattaforma Web per l'Analisi delle Dipendenze con LLM</em>
</p>

<p align="center">
  <a href="#-project-description-english">🇬🇧 English</a> •
  <a href="#-descrizione-del-progetto-italiano">🇮🇹 Italiano</a> •
  <a href="#-key-features--caratteristiche-principali">✨ Features</a> •
  <a href="#-platform-structure--struttura-della-piattaforma">🏗️ Structure</a>
</p>

---

## 👨‍💻 Team Members / Componenti del Team

<table align="center">
  <tr>
    <td align="center">
      <strong>Danilo Gisolfi</strong><br>
      <sub>Bachelor's Thesis</sub>
    </td>
    <td align="center">
      <strong>Vincenzo Maiellaro</strong><br>
      <sub>Bachelor's Thesis</sub>
    </td>
  </tr>
</table>

---

## 📖 Project Description (English)

**DEAL** is an interactive web platform designed for managing discovery results and their related statistics, supported by **Large Language Models** (LLM).

### 🎯 Main Goal

Simplify the analysis of dependencies within datasets and provide detailed information about each uploaded file, including dependency analysis results.

### 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        DEAL Platform                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    📁 FILE MANAGEMENT                     │   │
│  │  Upload • View • Search • Delete • Pin • Move             │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    📄 FILE DETAILS                        │   │
│  │                                                           │   │
│  │  ┌─────────┐    ┌─────────┐    ┌─────────────────┐       │   │
│  │  │ Dataset │    │Algorithm│    │   Dependencies  │       │   │
│  │  │  Info   │    │ Details │    │    Analysis     │       │   │
│  │  └─────────┘    └─────────┘    └─────────────────┘       │   │
│  │                                                           │   │
│  │              21 Interactive Cards in 3 Sections           │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    🤖 LLM Integration                     │   │
│  │         Dynamic Instructions • Prompt Engineering         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 📑 Two Main Pages

| Page | Description |
|------|-------------|
| 🗂️ **File Management** | Upload, view, search, delete, pin, and move files |
| 📄 **File Details** | Detailed view with 21 cards grouped into 3 sections |

### 🎯 Project Goals

- [x] Create an interactive web platform for file and dependency management
- [x] Provide detailed view of files with datasets, algorithms, and dependencies
- [x] Implement filtering system with real-time modifiable instructions
- [x] Integrate LLMs for dynamic instruction generation

---

## 📖 Descrizione del Progetto (Italiano)

**DEAL** è una piattaforma web interattiva progettata per gestire i risultati di discovery e le statistiche correlate, supportata da **Large Language Models** (LLM).

### 🎯 Obiettivo Principale

Semplificare l'analisi delle dipendenze nei dataset e fornire informazioni dettagliate su ogni file caricato, inclusi i risultati di analisi delle dipendenze.

### 📑 Le Due Pagine Principali

| Pagina | Descrizione |
|--------|-------------|
| 🗂️ **Gestione File** | Carica, visualizza, cerca, elimina, appunta e sposta i file |
| 📄 **Dettagli File** | Visualizza informazioni dettagliate con 21 card in 3 sezioni |

### 🎯 Obiettivi del Progetto

- [x] Creare una piattaforma web interattiva per la gestione dei file e delle dipendenze
- [x] Offrire visualizzazione dettagliata con dataset, algoritmi e dipendenze
- [x] Implementare sistema di filtri con istruzioni modificabili in tempo reale
- [x] Integrare LLM per generazione dinamica delle istruzioni

---

## ✨ Key Features / Caratteristiche Principali

| Feature | Description 🇬🇧 | Descrizione 🇮🇹 |
|---------|-----------------|-----------------|
| 🗂️ **File Management** | Upload, view, search, delete, pin, and move files | Carica, visualizza, cerca, elimina, appunta e sposta i file |
| 📄 **File Details** | 21 cards in 3 sections with detailed information | 21 card suddivise in 3 sezioni con informazioni dettagliate |
| 📊 **Dataset** | Dataset information and key characteristics | Informazioni sui dataset e caratteristiche principali |
| 🔬 **Algorithm** | Algorithm details for dependency discovery | Dettagli dell'algoritmo per la discovery delle dipendenze |
| 📈 **Dependency Analysis** | Filterable results through specific cards | Risultati filtrabili tramite card specifiche |
| 📝 **Dynamic Instructions** | Real-time prompt engineering and tuning | Prompt engineering e prompt tuning in tempo reale |

---

## 🔬 Technology Stack

| Layer | Technology |
|-------|------------|
| 🖥️ **Frontend** | React / Modern Web Framework |
| 🤖 **AI/LLM** | Large Language Models Integration |
| 📊 **Data** | Dependency Discovery & Analysis |
| 🔄 **Real-time** | Dynamic Prompt Engineering |

---

## 📊 File Details Structure / Struttura Dettagli File

The details page presents **21 cards** organized into **3 sections**:

| Section | Content |
|---------|---------|
| 📊 **Dataset** | Information about the analyzed dataset |
| 🔬 **Algorithm** | Details on the discovery algorithm used |
| 📈 **Dependencies** | Analysis results with interactive filters |

---

## 📜 License / Licenza

This project was developed as part of the **Bachelor's Thesis in Computer Science** by Danilo Gisolfi and Vincenzo Maiellaro.

Questo progetto è stato sviluppato come parte della **Tesi Triennale in Informatica** di Danilo Gisolfi e Vincenzo Maiellaro.

---

<p align="center">
  <strong>Made with ❤️ for Data Science Research</strong><br>
  <sub>DEAL • Dependencies Explanation with Advanced Language Models</sub>
</p>

<p align="center">
  <a href="#-deal">⬆️ Back to Top / Torna su</a>
</p>
