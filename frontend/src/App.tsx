import { lazy, Suspense, type ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, PublicOnlyRoute } from "./layouts/ProtectedRoute";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { PageLoader } from "./components/ui/Feedback";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Heavier routes (builder, charts, public renderer) are code-split.
const Templates = lazy(() => import("./pages/Templates"));
const Builder = lazy(() => import("./pages/Builder"));
const Responses = lazy(() => import("./pages/Responses"));
const Analytics = lazy(() => import("./pages/Analytics"));
const PublicForm = lazy(() => import("./pages/PublicForm"));
const Insights = lazy(() => import("./pages/Insights"));
const Inbox = lazy(() => import("./pages/Inbox"));
const Settings = lazy(() => import("./pages/Settings"));
const MyForms = lazy(() => import("./pages/MyForms"));

interface LazyProps {
  children: ReactNode;
}

function Lazy({ children }: LazyProps) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export default function App() {
  return (
    <Routes>
      {/* Public auth */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />

      {/* Public shareable form */}
      <Route
        path="/f/:slug"
        element={
          <Lazy>
            <PublicForm />
          </Lazy>
        }
      />

      {/* Builder is full-screen, outside the dashboard shell */}
      <Route
        path="/builder/:id"
        element={
          <ProtectedRoute>
            <Lazy>
              <Builder />
            </Lazy>
          </ProtectedRoute>
        }
      />

      {/* Dashboard shell */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/forms"
          element={
            <Lazy>
              <MyForms />
            </Lazy>
          }
        />
        <Route
          path="/insights"
          element={
            <Lazy>
              <Insights />
            </Lazy>
          }
        />
        <Route
          path="/inbox"
          element={
            <Lazy>
              <Inbox />
            </Lazy>
          }
        />
        <Route
          path="/settings"
          element={
            <Lazy>
              <Settings />
            </Lazy>
          }
        />
        <Route
          path="/templates"
          element={
            <Lazy>
              <Templates />
            </Lazy>
          }
        />
        <Route
          path="/forms/:id/responses"
          element={
            <Lazy>
              <Responses />
            </Lazy>
          }
        />
        <Route
          path="/forms/:id/analytics"
          element={
            <Lazy>
              <Analytics />
            </Lazy>
          }
        />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
