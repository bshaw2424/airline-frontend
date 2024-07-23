import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner";

const HomeDescription = ({ isLoading }) => {
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  const buttonClick = event => {
    event.preventDefault();
    setSending(true);
    isLoading(true);

    setTimeout(() => {
      setSending(false);
      isLoading(false);
      navigate("/airlines");
    }, 1000);
  };

  return (
    <section
      style={{
        height: "100vh",
        marginTop: ".5rem",
        marginBottom: "1rem",
      }}
      id="home-description-container"
      className="d-flex justify-content-center align-items-center"
    >
      <div style={{ height: "100%" }}>
        <div
          style={{
            display: "flex",
            height: "100%",
          }}
          className="container"
        >
          <p
            style={{
              fontSize: "3rem",
              color: "#333",
              paddingLeft: "1.5rem",
              textTransform: "capitalize",
              flex: 2,
            }}
            className="d-flex justify-content-center align-items-center"
          >
            Finding your next favorite travel destination awaits.
            <span className=" w-100 home-description-button-container">
              <Link
                className="btn btn-outline-dark mt-1 rounded-2 hero-btn d-flex justify-content-center align-items-center"
                onClick={buttonClick}
              >
                {sending ? (
                  <ThreeDots
                    visible={true}
                    height="35"
                    width="35"
                    color="#fff"
                    radius="9"
                    ariaLabel="three-dots-loading"
                    wrapperStyle={{}}
                    wrapperClass=""
                  />
                ) : (
                  "View Airlines"
                )}
              </Link>
            </span>
          </p>
          <div
            className="image-container"
            style={{
              width: "100%",
              height: "100%",
              flex: 4,
              padding: 0,
            }}
          >
            <img
              src="../airport.jpg"
              alt=""
              style={{ objectFit: "cover", height: "100%", width: "100%" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeDescription;
