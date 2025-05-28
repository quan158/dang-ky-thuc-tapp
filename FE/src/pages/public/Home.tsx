import { useNavigate } from 'react-router-dom';
import HeaderImg from '../../assets/images/welcome.png';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column flex-1">
      <div className="container">
        <img className="w-100 my-5" src={HeaderImg} alt="" />
      </div>
    </div>
  );
};

export default Home;