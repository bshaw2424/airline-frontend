import HomeDescription from "./HomeDescription";

const Hero = ({ isLoading }) => {
  return (
    <section id="hero">
      <HomeDescription isLoading={isLoading} />
    </section>
  );
};

export default Hero;
