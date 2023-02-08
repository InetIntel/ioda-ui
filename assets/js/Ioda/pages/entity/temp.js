
    this.setState(
      {
        xyChartOptions: {
          backgroundColor: "#ffffff",
          height: this.state.tsDataScreenBelow678 ? "360px" : "514px",
          animation: false,
          grid: {
            containLabel: true,
            width: "98%",
            ...chartGridSizing,
          },
          //rangeChanged: (e) => this.xyPlotRangeChanged(e),
          tooltip: {
            show: true,
            trigger: "item",
          },
          toolbox: {
            ...toolboxPosition,
            feature: {
              dataZoom: {
                yAxisIndex: "none",
              },
              restore: {},
            },
          },
          legend: {
            ...chartLegendPosition,
            itemWidth: 15,
            itemHeight: 8,
            textStyle: {
              fontFamily: CUSTOM_FONT_FAMILY,
              fontSize: this.state.tsDataScreenBelow678 ? 10 : 12,
              fontWeight: "bold",
            },
          },
          xAxis: {
            type: "time",
            name: xyChartXAxisTitle,
            splitNumber: 6,
            //TODO: stripLines: stripLines,
            nameLocation: "center",
            nameGap: 20,
            nameTextStyle: {
              fontSize: 12,
              fontFamily: CUSTOM_FONT_FAMILY,
            },
            axisPointer: {
              show: true,
              snap: true,
              triggerTooltip: true,
              type: "line",
              lineStyle: {
                type: "soid",
                color: "#c5c5c5",
              },
              label: {
                formatter: (params) =>
                  dayjs(params.value).format("ddd, MMM DD - h:mmA"),
                backgroundColor: "#000",
                fontSize: 10,
                fontFamily: CUSTOM_FONT_FAMILY,
              },
            },
            axisLabel: {
              fontSize: 10,
              fontFamily: CUSTOM_FONT_FAMILY,
              formatter: {
                year: "{yyyy}",
                month: "{MMM} {yyyy}",
                day: "{MMM} {dd} {yyyy}",
                hour: "{HH}:{mm}",
                minute: "{HH}:{mm}",
              },
              onZero: true,
            },
            axisLine: {
              onZero: true,
            },
            min: new Date(
              this.state.from * 1000 +
                new Date(this.state.from * 1000).getTimezoneOffset() * 60000
            ),
            max: new Date(
              this.state.until * 1000 +
                new Date(this.state.until * 1000).getTimezoneOffset() * 60000
            ),
          },
          yAxis: {
            type: "value",
            axisLabel: {
              fontSize: 12,
              fontFamily: CUSTOM_FONT_FAMILY,
              formatter: (value, index) => {
                if (this.state.tsDataNormalized) {
                  return value <= 100 ? value% : "";
                } else {
                  return value;
                }
              },
            },
            splitNumber: 10,
            splitLine: {
              show: true,
              lineStyle: {
                width: 1,
                color: "#E6E6E6",
                type: "dashed",
              },
            },
            max: this.state.tsDataNormalized
              ? 110
              : Math.max.apply(null, absoluteMax) * 1.1,
          },
          /*
          axisY: {
            titleFontsColor: "#666666",
            labelFontColor: "#666666",
            labelFontSize: 12,
            // minimum: 0,
            // maximum: this.state.tsDataNormalized ? 110 : Math.max.apply(null, absoluteMax) * 1.1,
            gridDashType: "dash",
            gridColor: "#E6E6E6",
            stripLines: this.state.tsDataNormalized
              ? normalizedStripline
              : null,
            labelFormatter: (event) => {
              if (this.state.tsDataNormalized) {
                return event.value <= 100 ? {event.value}% : "";
              } else {
                return event.value;
              }
            },
          },
          */
          /*
          axisY2: {
            // title: "Network Telescope",
            titleFontsColor: "#666666",
            labelFontColor: "#666666",
            labelFontSize: 12,
            // maximum: this.state.tsDataNormalized ? 110 : absoluteMaxY2 * 1.1,
          },
          */
          /*
          toolTip: {
            shared: false,
            enabled: true,
            animationEnabled: true,
          },
          */
          series: this.createXyVizDataObject(signalValues),
        },
      },
      () => {
        this.renderXyChart();
      }
    );