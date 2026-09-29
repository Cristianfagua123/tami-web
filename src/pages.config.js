import Wardrobe from './pages/Wardrobe';
import ManageVideos from './pages/ManageVideos';
import Layout from './Layout.jsx';


export const PAGES = {
    "Wardrobe": Wardrobe,
    "ManageVideos": ManageVideos,
}

export const pagesConfig = {
    mainPage: "Wardrobe",
    Pages: PAGES,
    Layout: Layout,
};