# ✈️ Flight Book

*A digital logbook to manage and analyze your paragliding flights*

[![Preview](https://img.shields.io/badge/📊-View%20Demo-blue?style=for-the-badge)](https://01ive.github.io/flight_book/)

---

## 🎯 About

**Flight Book** is a comprehensive web application to document, organize, and analyze your paragliding flights. Store your data in the cloud with Supabase, automatically generate reports, and explore your flight statistics.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 📋 **Flight Log Table** | View the complete history of your flights |
| 📍 **Site Management** | Catalog and organize your favorite takeoff sites |
| 📊 **Advanced Statistics** | Analyze your performance and progression |
| ☁️ **Cloud Synchronization** | Secure storage with Supabase |
| 📥 **Import/Export** | Convert your data to CSV |
| 🗺️ **GPS Traces** | Support for standard IGC files |
| 📱 **Responsive Interface** | Access from any device |

---

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/01ive/flight_book.git
cd flight_book

### Usage

1. **Open the web app** : Simply launch `index.html` in your browser
2. **Import your data** : Use the interface to import your flights
3. **Visualize your data** : 
   - Your flights : [flight.html](flight.html)
   - Your sites : [ground.html](ground.html)
   - Your stats : [stats.html](stats.html)

---

## 📦 Project Structure

```
flight_book/
├── index.html                 # 🏠 Main page
├── flight.html               # ✈️ Flights table
├── ground.html               # 📍 Sites management
├── stats.html                # 📊 Statistics
├── supabase.js               # ☁️ Supabase client
├── bundle.js                 # 📦 Compiled JavaScript assets
└── LICENSE                   # ⚖️ Project license
```

---

## 🔧 Configuration

### Supabase

The application uses Supabase for data storage. The tables used are:

- **`flights`** : 📋 Flight records
- **`ground`** : 📍 Takeoff sites
- **`stats`** : 📊 Aggregated statistics
- **`tracks`** (storage) : 🗺️ IGC files

### Environment Variables

Configure your Supabase client in `supabase.js` with your credentials.

---

## 💾 Data Formats

### IGC Files

GPS traces from your flights should be in **IGC** format (international standard format for aerial sports).

---

## 🌐 Deployment

The application is deployed on GitHub Pages:  
👉 [**https://01ive.github.io/flight_book/**](https://01ive.github.io/flight_book/)

To redeploy:

```bash
git push origin main
```

---

## 📚 Technologies Used

- 🌐 **Frontend** : HTML5, CSS3, JavaScript
- 📊 **Visualization** : DataTables.js
- ☁️ **Backend** : Supabase (PostgreSQL + Auth + Storage)
- 📤 **Synchronization** : FTP

---

## 📝 License

This project is licensed under [LICENSE](LICENSE).

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

- 🐛 Report bugs
- 💡 Suggest improvements
- 📤 Submit pull requests

---

## 📧 Support

For any questions or issues, check out the [live demo](https://01ive.github.io/flight_book/) or create an issue on the repository.

---

**🎿 Happy flying!** *Enjoy your flights and keep a record of every magical moment in the sky.*
