import RCImage, { ImageProps as RCImageProps } from "rc-image";
import cx from "classnames";

interface ImageProps extends Omit<RCImageProps, "fallback"> {}

export const Image = ({ className, width, ...rest }: ImageProps) => {
  return (
    <RCImage
      fallback="/images/placeholder.jpeg"
      className={cx("aspect-square object-cover", className)}
      width={width}
      {...rest}
    />
  );
};

Image.displayName = "Image";
