import React from "react";
import styles from "./Features.module.css";

const Features = () => {
  const featureList = [
    {
      icon: "🔍",
      title: "Search Medicines",
      description:
        "Find medicines in nearby pharmacies quickly and efficiently.",
    },
    {
      icon: "📍",
      title: "Location-Based Results",
      description: "Get accurate results based on your current location.",
    },
    {
      icon: "⚡",
      title: "Fast & Reliable",
      description:
        "Enjoy lightning-fast search results with real-time updates.",
    },
    {
      icon: "💊",
      title: "Medicine Availability",
      description:
        "Check if a medicine is in stock before visiting the pharmacy.",
    },
    {
      icon: "🛒",
      title: "Save Time & Effort",
      description:
        "Avoid unnecessary trips by finding the right pharmacy instantly.",
    },
  ];

  return (
    <section className={styles.features}>
      <h2>Key Features</h2>
      <div className={styles.featureGrid}>
        {featureList.map((feature, index) => (
          <div key={index} className={styles.featureCard}>
            <span className={styles.icon}>{feature.icon}</span>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
