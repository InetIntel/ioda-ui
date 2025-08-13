export const handleTooltipPointClick = (tooltipEnabledRef) =>
  function () {
    const chart = this.series.chart;
    tooltipEnabledRef.current = !tooltipEnabledRef.current;

    chart.update({
      tooltip: {
        enabled: tooltipEnabledRef.current,
      },
    });
  };
