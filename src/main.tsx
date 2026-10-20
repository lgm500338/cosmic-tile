import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { BackgroundGallery } from './components/BackgroundGallery';
import './index.css';

// 주소 뒤에 ?bg-gallery 를 붙이면 배경 사진 확인용 갤러리가 열린다
const showGallery = typeof window !== 'undefined' && window.location.search.includes('bg-gallery');

createRoot(document.getElementById('root')!).render(showGallery ? <BackgroundGallery /> : <App />);
