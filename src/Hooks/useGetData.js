import { useEffect, useState } from 'react';
import axios from 'axios';

const useGetData = (apiUrl) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(apiUrl);
      if (response.status === 200) {
        setData(response.data);
      }
    } catch (error) {
      console.log("Error Fetching Data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiUrl]);

  const refetch = () => {
    fetchData();
  };

  return { data, isLoading, refetch };
};

export default useGetData;