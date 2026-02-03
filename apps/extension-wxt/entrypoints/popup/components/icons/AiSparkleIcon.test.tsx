import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import AiSparkleIcon from "./AiSparkleIcon";

describe("AiSparkleIcon", () => {
  it("renders svg with expected viewBox", () => {
    const { container } = render(<AiSparkleIcon />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("viewBox")).toBe("0 0 14 14");
  });
});
