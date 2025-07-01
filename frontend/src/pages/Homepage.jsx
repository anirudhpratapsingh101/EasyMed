import React, { useEffect, useState } from "react";
import Features from "../components/Features";
import Reviews from "../components/Reviews";
import styles from "./Homepage.module.css";

const Homepage = () => {
  const [headingVisible, setHeadingVisible] = useState(false);
  const [paragraphVisible, setParagraphVisible] = useState(false);

  useEffect(() => {
    setHeadingVisible(true);
    const timer = setTimeout(() => setParagraphVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* About Section */}
      <section className={styles.about}>
        <h1
          className={`${styles.heading} ${
            headingVisible ? styles.headingVisible : ""
          }`}
        >
          Find Medicines Easily with EasyMed
        </h1>
        <p
          className={`${styles.paragraph} ${
            paragraphVisible ? styles.paragraphVisible : ""
          }`}
        >
          EasyMed helps you locate the nearest pharmacies that have the
          medicines you need. No more wandering from store to store—just search
          for a medicine, and we’ll show you where to find it.
        </p>
      </section>

      {/* Features Section */}
      <Features />

      {/* Reviews Section */}
      <Reviews />
    </>
  );
};

export default Homepage;
