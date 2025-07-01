import React, { useEffect, useRef, useState } from "react";
import styles from "./Features.module.css";
import SpotlightCard from "../../Reactbits/SpotlightCard/SpotlightCard";

const Features = () => {
  const featureList = [
    {
      icon: "🔍",
      title: "Search Medicines",
      description:
        "Find medicines in nearby pharmacies quickly and efficiently.",
      spotlightColor: "rgba(0, 229, 255, 0.2)",
    },
    {
      icon: "📍",
      title: "Location-Based Results",
      description: "Get accurate results based on your current location.",
      spotlightColor: "rgba(0, 255, 128, 0.2)",
    },
    {
      icon: "⚡",
      title: "Fast & Reliable",
      description:
        "Enjoy lightning-fast search results with real-time updates.",
      spotlightColor: "rgba(255, 215, 0, 0.2)",
    },
    {
      icon: "💊",
      title: "Medicine Availability",
      description:
        "Check if a medicine is in stock before visiting the pharmacy.",
      spotlightColor: "rgba(255, 0, 128, 0.15)",
    },
    {
      icon: "🛒",
      title: "Save Time & Effort",
      description:
        "Avoid unnecessary trips by finding the right pharmacy instantly.",
      spotlightColor: "rgba(128, 0, 255, 0.15)",
    },
  ];

  const cardRefs = useRef([]);
  const [visibleIndexes, setVisibleIndexes] = useState([]);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number(entry.target.getAttribute("data-index"));
          if (entry.isIntersecting && !visibleIndexes.includes(idx)) {
            setTimeout(() => {
              setVisibleIndexes((prev) => [...prev, idx]);
            }, 200 * idx);
          }
        });
      },
      { threshold: 0.2 }
    );

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      cardRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
    // eslint-disable-next-line
  }, []);

  return (
    <section className={styles.features} aria-labelledby="features-heading">
      <div className={styles.container}>
        <h2 id="features-heading" className={styles.heading}>
          Key Features
        </h2>
        <div className={styles.featureGrid}>
          {featureList.map((feature, index) => (
            <div
              key={index}
              ref={(el) => (cardRefs.current[index] = el)}
              data-index={index}
              className={`${styles.featureFloat} ${
                visibleIndexes.includes(index) ? styles.featureFloatVisible : ""
              }`}
            >
              <SpotlightCard
                className="custom-spotlight-card"
                spotlightColor={feature.spotlightColor}
              >
                <span className={styles.icon} aria-hidden="true">
                  {feature.icon}
                </span>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>
                  {feature.description}
                </p>
              </SpotlightCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
