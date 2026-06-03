function OwnerDashboard() {
  return (
    <div className="row">
      <div className="col-12">
        <div className="card shadow-sm">
          <div className="card-body">
            <h2>Owner Dashboard</h2>
            <p>Manage your properties, review tenant requests, and monitor occupancy.</p>
            <div className="row gy-3">
              <div className="col-md-4">
                <div className="card border-warning h-100">
                  <div className="card-body">
                    <h5 className="card-title">Property Listings</h5>
                    <p className="card-text">Update listings, images, availability, and pricing.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-danger h-100">
                  <div className="card-body">
                    <h5 className="card-title">Tenant Requests</h5>
                    <p className="card-text">Approve and respond to tenant requests quickly.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-success h-100">
                  <div className="card-body">
                    <h5 className="card-title">Performance</h5>
                    <p className="card-text">Track occupancy, revenue, and maintenance status.</p>
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

export default OwnerDashboard;
