import image04 from "/images/grid-image/image-04.png";
import image05 from "/images/grid-image/image-05.png";
import image06 from "/images/grid-image/image-06.png";

export default function ThreeColumnImageGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <div>
        <img
          src={image04}
          alt=" grid"
          className="border border-gray-200 rounded-xl dark:border-gray-800"
        />
      </div>

      <div>
        <img
          src={image05}
          alt=" grid"
          className="border border-gray-200 rounded-xl dark:border-gray-800"
        />
      </div>

      <div>
        <img
          src={image06}
          alt=" grid"
          className="border border-gray-200 rounded-xl dark:border-gray-800"
        />
      </div>
    </div>
  );
}
