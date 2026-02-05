import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import LogoIcon from "./LogoIcon";

describe("LogoIcon", () => {
  it("renders svg with expected viewBox", () => {
    const { container } = render(<LogoIcon />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("viewBox")).toBe("0 0 36 36");
  });
});
