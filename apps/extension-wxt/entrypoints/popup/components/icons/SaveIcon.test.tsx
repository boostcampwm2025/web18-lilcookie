import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import SaveIcon from "./SaveIcon";

describe("SaveIcon", () => {
  it("renders svg with expected viewBox", () => {
    const { container } = render(<SaveIcon />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("viewBox")).toBe("0 0 23 23");
  });
});
