import CategorySection from "./CategorySection";
import HomeFooter from "./HomeFooter";
import HomeHeader from "./HomeHeader";
import FoodScroll from "./FoodScroll";
import ProvinceCityDropdown from "./ProvinceCityDropdown";
import SearchBox from "./SearchBox";

export default function HomeScreen() {
    return (
      <div className="bg-[#FFF9F4]">
          <HomeHeader/>

          <div className="flex flex-col gap-8 items-center py-5">
            <ProvinceCityDropdown />
            {/* <SearchBox /> */}
          </div>


          <div className="w-[90%] mx-auto h-[1px] mt-2.5 bg-[#D9D9D9]"></div>

          <CategorySection/>
          
          <div className="w-[90%] mx-auto h-[1px] mt-2.5 bg-[#D9D9D9]"></div>

          <FoodScroll/>

          <HomeFooter/>
      </div>
    )

}
