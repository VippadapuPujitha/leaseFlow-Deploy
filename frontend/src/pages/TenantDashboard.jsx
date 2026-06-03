function TenantDashboard() {
  return (
    <div className="row">
      <div className="col-12">
        <div className="card shadow-sm">
          <div className="card-body">
            <h2>Tenant Dashboard</h2>
            <p>View your rental requests, active leases, and available properties.</p>
            <div className="row gy-3">
              <div className="col-md-4">
                <div className="card border-primary h-100">
                  <div className="card-body">
                    <h5 className="card-title">My Requests</h5>
                    <p className="card-text">Track submitted maintenance or lease requests.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-success h-100">
                  <div className="card-body">
                    <h5 className="card-title">Active Lease</h5>
                    <p className="card-text">Review your current lease details and payment calendar.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-info h-100">
                  <div className="card-body">
                    <h5 className="card-title">Available Properties</h5>
                    <p className="card-text">Browse properties tailored for tenants.</p>
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

export default TenantDashboard;
