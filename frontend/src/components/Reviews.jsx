import React from "react";
import styles from "./Reviews.module.css";

const Reviews = () => {
  const reviews = [
    {
      name: "Amit Sharma",
      review:
        "EasyMed saved me so much time! I found my medicine in just minutes.",
      avatar: "https://avatar.iran.liara.run/public/11",
    },
    {
      name: "Priya Patel",
      review: "No more running around pharmacies! EasyMed makes it effortless.",
      avatar: "https://avatar.iran.liara.run/public/45",
    },
    {
      name: "Rahul Verma",
      review: "Accurate and fast! I love how simple it is to use.",
      avatar: "https://avatar.iran.liara.run/public/18",
    },
  ];

  return (
    <section className={styles.reviews}>
      <h2>User Reviews</h2>
      <div className={styles.reviewList}>
        {reviews.map((r, index) => (
          <div key={index} className={styles.reviewCard}>
            <img src={r.avatar} alt={r.name} className={styles.avatar} />
            <h4>{r.name}</h4>
            <p>{r.review}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Reviews;
