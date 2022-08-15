import RCImage, { ImageProps as RCImageProps } from "rc-image";
import cx from "classnames";

interface ImageProps extends RCImageProps {}

export const Image = ({ className, width, ...rest }: ImageProps) => {
  return (
    <RCImage
      placeholder={
        <img
          width={width}
          className="w-full aspect-square object-cover"
          src={"/images/placeholder.jpeg"}
        />
      }
      className={cx("aspect-square object-cover", className)}
      width={width}
      {...rest}
    />
  );
};

Image.displayName = 'Image'