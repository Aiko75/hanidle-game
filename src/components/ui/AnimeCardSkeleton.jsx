"use client";

export default function AnimeCardSkeleton() {
  return (
    <div className="card h-100 border-0 shadow-sm" aria-hidden="true">
      {/* Khung ảnh Thumbnail (Giữ tỷ lệ giống AnimeCard thật) */}
      <div
        className="position-relative w-100 bg-secondary bg-opacity-10"
        style={{ paddingTop: "140%" }}
      >
        <div className="placeholder-glow w-100 h-100 position-absolute top-0 start-0">
          <span className="placeholder w-100 h-100 bg-secondary opacity-25"></span>
        </div>
      </div>

      <div className="card-body d-flex flex-column">
        {/* Khung Tiêu đề (2 dòng) */}
        <h5 className="card-title placeholder-glow mb-3">
          <span className="placeholder col-12 bg-secondary opacity-25 rounded"></span>
          {/* <span className="placeholder col-8 bg-secondary opacity-25 rounded"></span> */}
        </h5>

        <div className="mt-auto">
          {/* Khung Metadata (Năm & View) */}
          <div className="d-flex justify-content-between mb-3 placeholder-glow">
            <span className="placeholder col-3 bg-secondary opacity-25 rounded"></span>
            <span className="placeholder col-3 bg-secondary opacity-25 rounded"></span>
          </div>

          {/* Khung Button */}
          {/* <div className="placeholder-glow">
            <span
              className="placeholder col-12 btn btn-sm bg-secondary opacity-25 rounded-pill"
              style={{ height: "32px" }}
            ></span>
          </div> */}
        </div>
      </div>
    </div>
  );
}
