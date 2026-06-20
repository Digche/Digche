import CategorySection from "./CategorySection";
import DashboardFooter from "./DashboardFooter";
import DashboardHeader from "./DashboardHeader";
import FoodScroll from "./FoodScroll";
import ProvinceCityDropdown from "./ProvinceCityDropdown";
import SearchBox from "./SearchBox";

export default function DashboardScreen() {
    return (
      <div>
          <DashboardHeader/>

          <div className="flex flex-col gap-8 items-center py-5">
            <ProvinceCityDropdown />
            <SearchBox />
          </div>


          <div className="w-[90%] mx-auto h-[1px] mt-2.5 bg-[#D9D9D9]"></div>

          <CategorySection/>
          
          <div className="w-[90%] mx-auto h-[1px] mt-2.5 bg-[#D9D9D9]"></div>

          <FoodScroll/>

          <DashboardFooter/>
      </div>
    )

}
