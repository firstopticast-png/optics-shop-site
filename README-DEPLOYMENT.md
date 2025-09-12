# Optics Sonata - Complete Website Package

## 📋 Overview
This is a complete Next.js web application for Optics Sonata - a professional optics management system with order processing, PDF generation, and WhatsApp integration.

## 🚀 Features
- ✅ Beautiful professional interface with dark green eye logo
- ✅ Complete order management system
- ✅ Customer information management
- ✅ Prescription data handling (OD/OS: Sph, Cyl, Ax, Pd, Add)
- ✅ Product management with add/remove functionality
- ✅ Cost calculations and payment tracking
- ✅ PDF generation for orders
- ✅ WhatsApp integration for customer communication
- ✅ Save orders to localStorage
- ✅ Responsive design for all devices

## 🛠 Tech Stack
- **Framework**: Next.js 15.5.2
- **React**: 19.1.0
- **UI Components**: shadcn/ui with Radix UI
- **Styling**: Tailwind CSS
- **PDF Generation**: jsPDF
- **Icons**: Lucide React
- **Notifications**: Sonner

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ or Bun
- macOS, Windows, or Linux

### Option 1: Using Node.js & npm
```bash
# Extract the package
tar -xzf optics-sonata-complete.tar.gz
cd optics-sonata-new

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

### Option 2: Using Bun (Recommended for faster performance)
```bash
# Extract the package
tar -xzf optics-sonata-complete.tar.gz
cd optics-sonata-new

# Install dependencies
bun install

# Run development server
bun dev

# Build for production
bun run build
bun start
```

## 🌐 Local Development
After running the development server, open:
- **Local**: http://localhost:3000
- The application will automatically reload when you make changes

## 🚀 Deployment Options

### 1. Vercel (Recommended - Free)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd optics-sonata-new
vercel

# Follow the prompts to deploy
```

### 2. Netlify
```bash
# Build the project
npm run build

# Upload the 'out' folder to Netlify
# Or connect your GitHub repository to Netlify
```

### 3. GitHub Pages
```bash
# Add to your GitHub repository
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/optics-sonata.git
git push -u origin main

# Enable GitHub Pages in repository settings
```

### 4. Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```

### 5. Heroku
```bash
# Install Heroku CLI
# Create Procfile
echo "web: npm start" > Procfile

# Deploy
heroku create your-app-name
git push heroku main
```

### 6. DigitalOcean App Platform
- Upload your code to GitHub
- Connect GitHub repository to DigitalOcean App Platform
- Configure build settings:
  - Build Command: `npm run build`
  - Run Command: `npm start`

## 📁 Project Structure
```
optics-sonata-new/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── ClientsDatabase.tsx
│   ├── CostManagement.tsx
│   ├── FinancialDashboard.tsx
│   ├── OrderForm.tsx     # Main order form
│   ├── ProductsDatabase.tsx
│   └── SalesReports.tsx
├── lib/                  # Utilities
│   ├── utils/
│   │   └── order-actions.ts  # PDF, Save, WhatsApp functions
│   └── utils.ts
├── public/               # Static assets
├── package.json          # Dependencies
├── tailwind.config.js    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── next.config.ts        # Next.js configuration
```

## 🔧 Key Components

### OrderForm.tsx
Main order form component with:
- Customer information fields
- Prescription data (OD/OS)
- Product management
- Cost calculations
- Action buttons (Save, PDF, WhatsApp)

### order-actions.ts
Contains three main functions:
- `handleSave()` - Saves order data to localStorage
- `handlePrintPDF()` - Generates PDF using jsPDF
- `handleWhatsApp()` - Opens WhatsApp with pre-filled message

## 🎨 Customization

### Colors & Branding
Edit `app/globals.css` and `tailwind.config.js` to customize:
- Primary colors (currently dark green theme)
- Logo and branding
- Typography

### Adding New Features
- Add new components in `components/` directory
- Add new pages in `app/` directory
- Extend functionality in `lib/utils/`

## 📱 Mobile Responsiveness
The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🔒 Environment Variables
Create `.env.local` file for any environment-specific settings:
```env
NEXT_PUBLIC_APP_NAME=Optics Sonata
NEXT_PUBLIC_COMPANY_PHONE=+7 (727) 123-45-67
```

## 🐛 Troubleshooting

### Common Issues:
1. **Port already in use**: Change port with `PORT=3001 npm run dev`
2. **Dependencies issues**: Delete `node_modules` and run `npm install` again
3. **Build errors**: Check Node.js version (requires 18+)

### Performance Optimization:
- Images are optimized with Next.js Image component
- CSS is automatically optimized with Tailwind
- JavaScript is bundled and minified in production

## 📞 Support
For technical support or customization requests, contact the development team.

## 📄 License
This project is proprietary software for Optics Sonata.

---

**Ready to use!** 🎉
The website is fully functional and ready for production deployment.
