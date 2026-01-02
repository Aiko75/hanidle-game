"use client";

export default function AnimeDetailSkeleton() {
  return (
    <div className="py-5 bg-zinc-50 min-vh-100">
      <div className="container">
        {/* Breadcrumb / Back Button Skeleton */}
        <div className="mb-4 placeholder-glow">
          <span className="py-2 opacity-25 placeholder col-2 col-md-1 rounded-pill btn btn-secondary disabled"></span>
        </div>

        <div className="row g-5">
          {/* CỘT TRÁI: ẢNH & NÚT SKELETON */}
          <div className="col-md-4 col-lg-3">
            {/* Ảnh Cover */}
            <div
              className="overflow-hidden bg-white border-0 shadow-lg card rounded-4"
              aria-hidden="true"
            >
              <div className="placeholder-glow">
                <div
                  className="opacity-25 placeholder w-100 bg-secondary"
                  style={{ height: "450px" }} // Chiều cao xấp xỉ ảnh thật
                ></div>
              </div>
            </div>

            {/* Nút Xem Phim */}
            <div className="gap-2 mt-4 d-grid placeholder-glow">
              <span
                className="opacity-50 placeholder btn btn-lg rounded-pill col-12 bg-primary"
                style={{ height: "50px" }}
              ></span>
            </div>
          </div>

          {/* CỘT PHẢI: THÔNG TIN CHI TIẾT SKELETON */}
          <div className="col-md-8 col-lg-9">
            {/* Title */}
            <h1 className="mb-3 display-5 fw-bold placeholder-glow">
              <span className="rounded opacity-50 placeholder col-8 bg-secondary"></span>
            </h1>

            {/* Metadata Badges */}
            <div className="flex-wrap gap-2 mb-4 d-flex placeholder-glow">
              <span
                className="py-3 rounded opacity-25 placeholder col-2 bg-secondary"
                style={{ width: "80px" }}
              ></span>
              <span
                className="py-3 rounded opacity-25 placeholder col-2 bg-success"
                style={{ width: "120px" }}
              ></span>
              <span
                className="py-3 rounded opacity-25 placeholder col-2 bg-warning"
                style={{ width: "100px" }}
              ></span>
            </div>

            {/* Synopsis */}
            <div className="mb-5">
              <h4 className="pb-2 mb-3 border-bottom border-secondary placeholder-glow">
                <span className="opacity-50 placeholder col-3 bg-secondary"></span>
              </h4>
              <div className="placeholder-glow">
                <span className="mb-1 opacity-25 placeholder col-12 bg-secondary"></span>
                <span className="mb-1 opacity-25 placeholder col-12 bg-secondary"></span>
                <span className="mb-1 opacity-25 placeholder col-12 bg-secondary"></span>
                <span className="opacity-25 placeholder col-8 bg-secondary"></span>
              </div>
            </div>

            {/* Thông tin bảng */}
            <div className="row g-4">
              <div className="col-12">
                <h5 className="mb-3 placeholder-glow">
                  <span className="opacity-50 placeholder col-3 bg-secondary"></span>
                </h5>

                <div className="p-4 bg-white shadow-sm rounded-3">
                  <div className="gap-3 placeholder-glow d-flex flex-column">
                    {/* Row 1: Studio */}
                    <div className="gap-3 d-flex">
                      <span className="rounded opacity-25 placeholder col-3 bg-secondary"></span>
                      <span className="rounded opacity-25 placeholder col-4 bg-info"></span>
                    </div>
                    {/* Row 2: Thể loại */}
                    <div className="gap-3 d-flex">
                      <span className="rounded opacity-25 placeholder col-3 bg-secondary"></span>
                      <div className="gap-1 col-8 d-flex">
                        <span className="rounded placeholder col-2 bg-secondary opacity-10"></span>
                        <span className="rounded placeholder col-2 bg-secondary opacity-10"></span>
                        <span className="rounded placeholder col-3 bg-secondary opacity-10"></span>
                      </div>
                    </div>
                    {/* Row 3: Censorship */}
                    <div className="gap-3 d-flex">
                      <span className="rounded opacity-25 placeholder col-3 bg-secondary"></span>
                      <span className="rounded opacity-25 placeholder col-2 bg-secondary"></span>
                    </div>
                    {/* Row 4: Date */}
                    <div className="gap-3 d-flex">
                      <span className="rounded opacity-25 placeholder col-3 bg-secondary"></span>
                      <span className="rounded opacity-25 placeholder col-3 bg-secondary"></span>
                    </div>
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
