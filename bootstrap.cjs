const fs = require('fs');
const path = require('path');

const dirs = [
  'src/router',
  'src/context',
  'src/layouts',
  'src/pages',
  'src/components/dashboard',
  'src/components/tables',
  'src/components/shared',
  'src/components/forms',
  'src/hooks',
  'src/services',
  'src/utils',
];

const files = [
  'src/router/AppRouter.jsx',
  'src/context/AuthContext.jsx',
  'src/context/ThemeContext.jsx',
  'src/context/ToastContext.jsx',
  'src/layouts/MainLayout.jsx',
  'src/layouts/Sidebar.jsx',
  'src/layouts/Topbar.jsx',
  'src/pages/DashboardPage.jsx',
  'src/pages/UsersPage.jsx',
  'src/pages/DrawsPage.jsx',
  'src/pages/PaymentsPage.jsx',
  'src/pages/ActivitiesPage.jsx',
  'src/pages/LogsPage.jsx',
  'src/pages/SettingsPage.jsx',
  'src/components/dashboard/StatCard.jsx',
  'src/components/dashboard/RevenueChart.jsx',
  'src/components/dashboard/RecentActivity.jsx',
  'src/components/dashboard/KPIGrid.jsx',
  'src/components/tables/DataTable.jsx',
  'src/components/tables/Pagination.jsx',
  'src/components/tables/SearchBar.jsx',
  'src/components/shared/Modal.jsx',
  'src/components/shared/Toast.jsx',
  'src/components/shared/Loader.jsx',
  'src/components/shared/EmptyState.jsx',
  'src/components/shared/RequireRole.jsx',
  'src/components/forms/DrawForm.jsx',
  'src/components/forms/UserEditForm.jsx',
  'src/components/forms/SettingsForm.jsx',
  'src/hooks/useAuth.js',
  'src/hooks/useToast.js',
  'src/hooks/usePagination.js',
  'src/services/api.js',
  'src/services/auth.service.js',
  'src/services/draw.service.js',
  'src/services/payment.service.js',
  'src/services/analytics.service.js',
  'src/utils/constants.js',
  'src/utils/formatters.js',
  'src/utils/permissions.js'
];

dirs.forEach(dir => {
  const p = path.join(__dirname, dir);
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
    console.log(`Created dir: ${dir}`);
  }
});

files.forEach(file => {
  const p = path.join(__dirname, file);
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, '// ' + file + ' generated\n');
    console.log(`Created file: ${file}`);
  }
});

console.log('Bootstrap complete.');
