import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { BackgroundGallery } from './components/BackgroundGallery';
import { TileGallery } from './components/TileGallery';
import './index.css';

// 주소 뒤에 ?bg-gallery 를 붙이면 배경 사진 확인용 갤러리, ?tile-gallery 는 천체 타일 갤러리가 열린다
const search = typeof window !== 'undefined' ? window.location.search : '';
const page = search.includes('bg-gallery') ? <BackgroundGallery /> : search.includes('tile-gallery') ? <TileGallery /> : <App />;

createRoot(document.getElementById('root')!).render(page);
