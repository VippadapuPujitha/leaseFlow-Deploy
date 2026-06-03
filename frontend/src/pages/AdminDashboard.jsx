function AdminDashboard() {
  return (
    <div className="row">
      <div className="col-12">
        <div className="card shadow-sm">
          <div className="card-body">
            <h2>Admin Dashboard</h2>
            <p>Review application activity, manage users, and monitor platform health.</p>
            <div className="row gy-3">
              <div className="col-md-4">
                <div className="card border-secondary h-100">
                  <div className="card-body">
                    <h5 className="card-title">User Management</h5>
                    <p className="card-text">Approve or suspend owners and tenants.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-info h-100">
                  <div className="card-body">
                    <h5 className="card-title">Reports</h5>
                    <p className="card-text">Access analytics for requests, properties, and users.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-dark h-100">
                  <div className="card-body">
                    <h5 className="card-title">System Settings</h5>
                    <p className="card-text">Maintain platform rules, roles, and access controls.</p>
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

export default AdminDashboard;
